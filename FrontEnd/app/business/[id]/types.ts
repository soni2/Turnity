export type usuario = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  detalles: string;
  direccion: string;
  avatar_url: string;
};

export type empleado = {
  id: string;
  nombre: string;
  foto_url: string;
  usuario: usuario;
  biografia: string;
};

export type servicio = {
  id: string;
  nombre: string;
  precio: string;
  duracion: string;
  descripcion: string;
  activo: boolean;
};

export type profesional = {
  id: string;
  nombre: string;
  especialidad: string;
  experiencia: string;
};

export type turno = {
  id: string;
  fecha: string;
  hora_inicio: string;
  estado: string;
  servicio?: servicio;
  empleado_id?: string;
};

export type ResenaInfo = {
  id: string;
  rating: number;
  comentario: string;
  creado_en: string;
  empleado_id?: string;
  cliente?: {
    nombre: string;
    avatar_url: string | null;
  };
};

export type CentroData = {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  telefono: string;
  ciudad: string;
  logo_url: string | null;
  imagenes: string[];
  horario: string;
  horariosRaw: Record<
    string,
    { abierto: boolean; apertura: string; cierre: string }
  >;
  horariosDisponibles: Record<string, string[]>;
  servicios: (servicio & { disponible: boolean })[];
  profesionales: (profesional & {
    foto_url: string | null;
    ratingStr: string;
    ratingCount: number;
  })[];
  resenas: ResenaInfo[];
  turnosFuturos: turno[];
  promedioRating: string;
};
