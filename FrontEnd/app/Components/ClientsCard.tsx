type ClientsCardProps = {
  texto: string;
  autor: string;
  estrellas: number;
  image: string;
};

export default function ClientsCard({
  texto,
  autor,
  estrellas,
  image,
}: ClientsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-row content-between gap-5">
      <div className="flex flex-col justify-center">
        <div className="bg-gray-400 w-24 h-24 rounded-full object-cover">
          <img
            className="w-full h-full rounded-full object-cover"
            src={image}
            alt="cliente"
          />
        </div>
      </div>
      <div className="flex flex-col justify-left text-sm place-content-between">
        <p className="text-gray-700 mb-4 italic">{texto}</p>
        <p className="font-semibold text-gray-900 mb-2">{autor}</p>

        <div className="flex text-yellow-400 text-xl">
          {"★".repeat(estrellas)}
        </div>
      </div>
    </div>
  );
}
