export interface Cita {
  id: string;
  fecha: string;
  hora_inicio: string;
  estado: string;
  servicio?: { nombre: string; negocio?: { id: string; nombre: string } };
}
