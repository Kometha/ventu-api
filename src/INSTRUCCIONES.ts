/**
 * INSTRUCCIONES DE USO - nest-starter
 * ====================================
 * 
 * Este template de NestJS incluye:
 * 1. Logger personalizado de NestJS
 * 2. Swagger para documentación de API
 * 3. Validaciones con class-validator
 * 4. Conexión a PostgreSQL
 * 5. Módulo de ejemplo (Sample) con CRUD in-memory
 * 6. Módulo de Formas de Pago conectado a PostgreSQL
 * 
 * 
 * CONFIGURACIÓN INICIAL
 * ---------------------
 * 
 * 1. El archivo .env ya contiene las credenciales de tu base de datos PostgreSQL
 *    Puedes modificarlo según tus necesidades:
 * 
 *    DB_HOST=3.20.8.175
 *    DB_PORT=5432
 *    DB_USER=db_service
 *    DB_PASSWORD=db_service_hn#$%
 *    DB_NAME=servicentrowillydb
 * 
 * 2. Instalar dependencias (si aún no lo hiciste):
 *    npm install
 * 
 * 
 * CÓMO INICIAR LA APLICACIÓN
 * ---------------------------
 * 
 * Modo desarrollo (con hot-reload):
 *   npm run start:dev
 * 
 * Modo producción:
 *   npm run build
 *   npm run start:prod
 * 
 * 
 * ENDPOINTS DISPONIBLES
 * ---------------------
 * 
 * Una vez iniciada la aplicación, los endpoints estarán disponibles en:
 * http://localhost:3000
 * 
 * Documentación Swagger:
 *   http://localhost:3000/api
 * 
 * Endpoints del módulo Sample (CRUD in-memory):
 *   GET    /sample       - Obtener todos los samples
 *   GET    /sample/:id   - Obtener un sample por ID
 *   POST   /sample       - Crear un nuevo sample
 *   PATCH  /sample/:id   - Actualizar un sample
 *   DELETE /sample/:id   - Eliminar un sample
 * 
 * Endpoints de Formas de Pago (PostgreSQL):
 *   GET    /formas-pago  - Obtener formas de pago desde la BD
 *                          (llama a la función: facturacion.ft_obtiene_formas_pago())
 * 
 * 
 * ESTRUCTURA DEL PROYECTO
 * -----------------------
 * 
 * src/
 *   ├── main.ts                    # Punto de entrada con configuración de Swagger y logger
 *   ├── app.module.ts              # Módulo raíz que importa todos los módulos
 *   │
 *   ├── config/                    # Configuración y tipos de variables de entorno
 *   │   └── environment.d.ts       # Definición de tipos para .env
 *   │
 *   ├── database/                  # Módulo de conexión a PostgreSQL
 *   │   ├── database.module.ts     # Módulo global de base de datos
 *   │   └── database.service.ts    # Servicio con pool de conexiones y métodos
 *   │
 *   ├── sample/                    # Módulo de ejemplo con CRUD in-memory
 *   │   ├── dto/                   # DTOs con validaciones
 *   │   ├── entities/              # Entidades del dominio
 *   │   ├── sample.controller.ts   # Controlador REST
 *   │   ├── sample.service.ts      # Lógica de negocio
 *   │   └── sample.module.ts       # Módulo
 *   │
 *   └── formas-pago/               # Módulo de formas de pago (PostgreSQL)
 *       ├── dto/                   # DTOs de respuesta
 *       ├── formas-pago.controller.ts  # Controlador REST
 *       ├── formas-pago.service.ts     # Lógica de negocio con BD
 *       └── formas-pago.module.ts      # Módulo
 * 
 * 
 * AGREGAR NUEVOS ENDPOINTS DE POSTGRESQL
 * ---------------------------------------
 * 
 * Para agregar más endpoints que llamen a funciones de PostgreSQL:
 * 
 * 1. Puedes usar el DatabaseService en cualquier servicio:
 * 
 *    constructor(private readonly databaseService: DatabaseService) {}
 * 
 * 2. Para ejecutar una función de PostgreSQL:
 * 
 *    const resultado = await this.databaseService.executeFunction<TipoRetorno>(
 *      'nombre_esquema.nombre_funcion',
 *      [parametro1, parametro2]  // Array vacío si no hay parámetros
 *    );
 * 
 * 3. Para ejecutar una query SQL directa:
 * 
 *    const resultado = await this.databaseService.query(
 *      'SELECT * FROM tabla WHERE campo = $1',
 *      [valor]
 *    );
 * 
 * 
 * VALIDACIONES
 * ------------
 * 
 * Todas las validaciones están configuradas globalmente en main.ts
 * Usá los decoradores de class-validator en tus DTOs:
 * 
 *   @IsString()
 *   @IsNotEmpty()
 *   @MinLength(3)
 *   @MaxLength(100)
 *   nombre: string;
 * 
 * 
 * LOGGER
 * ------
 * 
 * Para usar el logger en cualquier clase:
 * 
 *   private readonly logger = new Logger(NombreClase.name);
 *   
 *   this.logger.log('Mensaje informativo');
 *   this.logger.error('Mensaje de error');
 *   this.logger.warn('Advertencia');
 *   this.logger.debug('Debug info');
 * 
 * 
 * DOCUMENTACIÓN SWAGGER
 * ---------------------
 * 
 * Todos los endpoints están documentados automáticamente.
 * Usá los decoradores de @nestjs/swagger para mejorar la documentación:
 * 
 *   @ApiTags('nombre-tag')
 *   @ApiOperation({ summary: 'Descripción' })
 *   @ApiResponse({ status: 200, description: 'Éxito', type: TipoDto })
 *   @ApiParam({ name: 'id', description: 'ID del recurso' })
 * 
 * 
 * PRÓXIMOS PASOS
 * --------------
 * 
 * 1. Probá los endpoints en Swagger: http://localhost:3000/api
 * 2. Verificá la conexión a PostgreSQL cuando inicies la app
 * 3. Probá el endpoint GET /formas-pago para verificar la conexión a la BD
 * 4. Creá nuevos módulos siguiendo la estructura de 'sample' o 'formas-pago'
 * 5. Agregá más funciones de PostgreSQL según tus necesidades
 * 
 */

