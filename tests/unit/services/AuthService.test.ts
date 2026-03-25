import { User } from "../../../src/domain/entities/User";
import { IUserRepository } from "../../../src/domain/interfaces/IUserRepository";
import { RegisterDto } from "../../../src/dtos/RegisterDto";
import { AuthService } from "../../../src/services/AuthService";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService - Unit test', () => {
    // ARRANGE
    let authService: AuthService;
    let mockUserRepository: jest.Mocked<IUserRepository>;
  
    const validRegisterDto: RegisterDto = {
      email: 'sofia@testing.com',
      password: 'academynode',
      name: 'Sofia Testing'
    }

    const hashedPassword = 'hashed_academynode_123';
    const mockToken = 'mock_jwt_token_123';

    /**
     * SETUP: El beforeEach se ejecuta antes de cada test
     * Cada test empieza con un estado limpio
     */
    beforeEach(() => {
      mockUserRepository = {
        findByEmail: jest.fn(), // Graba en findByEmail.mocks.calls
        create: jest.fn() // Graba en create.mocks.calls
      }
      /**
       * Los *.mocks.calls son un historial que graba todos los argumentos de cada llamada a la función
       * 1. Verifica que parametros recibio
       * 2. Cuantas veces fue llamado
       * 3. Tambien el orden de llamadas
       */
      authService = new AuthService(mockUserRepository);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
    })

    /**TEARDOWN: afeterEach limpia despues de cada test */
    afterEach(() => {
      jest.clearAllMocks(); // Esta función resetea COMPLEMENTAMENTE el estado de todos los mocks
    })

    describe('register()', ()=> {
      it('deberia registar a un nuevo usuario de manera exitosa y retornar el jwt', async () => {
        
        // ARRANGE: Preparar datOs y comportamiento esperado
        // nota: tambien reutilizamos codigo de beforeEach
        const expectedUser = new User(
          expect.any(String),
          validRegisterDto.email,
          hashedPassword,
          validRegisterDto.name          
        );

        // Mock : Usuario no existente en la base de dtos
        // le pasamos null por que simulamos que el usuario no existe
        mockUserRepository.findByEmail.mockResolvedValue(null);

        // Mock: de creacion exitosa
        // Esto quiere decir que cuando se cree un usuario debe devolver el expectedUser
        mockUserRepository.create.mockResolvedValue(expectedUser);

        // ACT: Ejecutar la funcionaidad que deseamos testear "register"

        const result = await authService.register(validRegisterDto);

        expect(result).toHaveProperty('token', mockToken);
        expect(result).toHaveProperty('user');

        // Afirmaciones que podriamos denominar SEGURIDAD
        expect(result.user).not.toHaveProperty('password');

        // Verificar que el email coincide exactamente con el email que se envio para registrar el usuario
        expect(result.user.email).toBe(validRegisterDto.email);
        expect(result.user.name).toBe(validRegisterDto.name);

        // Verificar que findByEmail se llama exactamente una sola vez
        // No debe llamarse mas de una vez ni 0 veces (si es asi sera un BUG)

        // Jest verifica mockUserRepository.findByEmail.mock.calls.length === 1
        expect(mockUserRepository.findByEmail).toHaveBeenCalledTimes(1);

        /* Verificar que bcrypt.hash() se llamo con 
        Parametro 1: el password en texto plano ('academynode)
        Parametro 2: El salt rounds (10 = nivel de seguridad)

        Como logramos esto como funciona?
        Jest comapra los parametros grabados

        bcrypt.hash.mock.calls[0][0] === validRegisterDto.password
        bcrypt.hash.mock.calls[0][1] === 10
        */
       expect(bcrypt.hash).toHaveBeenCalledWith(validRegisterDto.password, 10);

       // Jest verifica mockUserRepository.create.mock.calls.length === 1
       expect(mockUserRepository.create).toHaveBeenCalledTimes(1);

      /**
       * Verificar que jwt.sign() se llamó con los parametros correctos
       * parametro 1: payload del token (debe contener al menos el email o propiedad email)
       * parametro 2: Secret key para firmar el jwt ('TU_SECRETO_JWT')
       * parametro 3: Opciones expiresIn: '1h' token es valido por una hora
       * 
       * Recuerda que Jest grabo todos parametros con el mock.calls
       */
       expect(jwt.sign).toHaveBeenCalledWith(expect.objectContaining({email: validRegisterDto.email}), 'TU_SECRETO_JWT', {expiresIn: '1h'})

      });

      // TEST 2: Caso de Error - EL USUARIO ya existe con ese correo (email)
      it('deberia generar un error cuando usuario ya esta registrado con ese email', async () => {
        // ARRANGE usuario ya existe en la base 
        // nota: tambien reutilizamos codigo de beforeEach
        const existingUser = new User(
          '123',
          validRegisterDto.email,
          'old password',
          'old name'
        );

        mockUserRepository.findByEmail.mockResolvedValue(existingUser);

        await expect(authService.register(validRegisterDto))// Ejecuta esto y espera
        .rejects// la promesa falla (reject)
        .toThrow('El usuario ya existe'); // el motivo del fallo debe ser el texto exacto ''El usuario ya existe'

        // Verify
        expect(bcrypt.hash).not.toHaveBeenCalled();
        expect(mockUserRepository.create).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
      })


    })

   

});