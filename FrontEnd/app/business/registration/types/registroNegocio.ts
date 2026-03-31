export type Dia =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export type HorarioDia = {
  abierto: boolean;
  apertura: string;
  cierre: string;
  aperturaManana?: string;
  cierreManana?: string;
  aperturaTarde?: string;
  cierreTarde?: string;
};

export type Horarios = Record<Dia, HorarioDia>;
export type CampoHorarios = keyof HorarioDia;

export type Servicio = {
  id: number;
  nombre: string;
  precio: string;
  duracion: string;
  descripcion: string;
};

export type Profesional = {
  id: number;
  nombre: string;
  especialidad: string;
  experiencia: string;
};

export type MetodosPago = {
  efectivo: boolean;
  tarjeta: boolean;
  transferencia: boolean;
};

export type FormData = {
  // Paso 1
  nombreNegocio: string;
  categoria: string;
  descripcion: string;
  email: string;
  telefono: string;
  sitioWeb: string;

  // Paso 2
  direccion: string;
  ciudad: string;
  // sector: string;
  coordenadas: string;

  // Paso 3
  horarios: Horarios;

  // Paso 4
  servicios: Servicio[];

  // Paso 5
  profesionales: Profesional[];

  // Paso 6
  fotos: File[];
  logo: File | null;

  // Paso 7
  metodosPago: MetodosPago;
};
