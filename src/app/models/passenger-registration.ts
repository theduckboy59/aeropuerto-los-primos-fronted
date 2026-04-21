export interface PassengerRegistrationRequest {
  username: string;
  email: string;
  password: string;
  tipoDocumentoId: number;
  numeroDocumento: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  nacionalidadId: number;
  codigoArea?: string;
  telefono: string;
  telefonoEmergencia?: string;
  direccion: string;
}
