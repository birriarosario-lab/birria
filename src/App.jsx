import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ndfyprlotymizqyvdzsx.supabase.co",
  "sb_publishable_dgrq5VEKaSSbkrR2i-tiFw_ZGsHfDuJ"
);

export default function App() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    loadEvents();

    // 🔐 activar admin con ?admin
    if (window.location.search.includes("admin")) {
      setIsAdmin(true);
    }
  }, []);

  // 📥 cargar eventos
  const loadEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("id", { ascending: false });

    setEvents(data || []);
  };

  // 📤 subir flyers
  const handleDrop = async (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    for (let file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "birria_unsigned");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dbfwgk9jq/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      await supabase.from("events").insert([
        {
          image: data.secure_url,
          title: "Nuevo Evento",
          date: "Editar fecha",
          dj: "DJ Invitado",
        },
      ]);
    }

    loadEvents();
  };

  // 🗑 borrar evento
  const deleteEvent = async (id) => {
    await supabase.from("events").delete().eq("id", id);
    loadEvents();
  };

  // 💰 link de pago
  const createPaymentLink = () => {
    return "https://link.mercadopago.com.ar/ticketsbirria";
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <h1 className="text-7xl neon-text">BIRRIA</h1>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-pink-500 p-10 text-center rounded-xl"
        >
          Arrastrá flyers acá 🔥
        </div>
      </section>

      {/* EVENTS */}
      <section className="p-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {events.map((ev) => (
          <div
  key={ev.id}
  onClick={() => setSelected(ev)}
  className="cursor-pointer"
>
            <img src={ev.image} className="rounded-xl mb-2" />
            <p className="font-bold">{ev.title}</p>
            <p className="text-sm text-zinc-400">{ev.date}</p>

            {isAdmin && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setEditingEvent(ev)}
                  className="bg-blue-500 px-2 py-1 rounded"
                >
                  Editar
                </button>

                <button
                  onClick={() => deleteEvent(ev.id)}
                  className="bg-red-500 px-2 py-1 rounded"
                >
                  Borrar
                </button>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* MODAL EVENTO */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-zinc-900 p-6 rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selected.image} className="rounded mb-4" />

            <h3 className="text-2xl mb-2">{selected.title}</h3>
            <p className="text-zinc-400">{selected.date}</p>
            <p className="mb-4">{selected.dj}</p>

            <a
              href={createPaymentLink()}
              target="_blank"
              className="block text-center bg-yellow-500 py-3 rounded-xl font-bold mb-3"
            >
              Comprar Entrada
            </a>

            <a
              href={`https://wa.me/5493415446431?text=Quiero reservar ${selected.title}`}
              target="_blank"
              className="block text-center bg-green-500 py-3 rounded-xl font-bold"
            >
              Reservar por WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* 🧠 PANEL EDITOR PRO */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl mb-4">Editar Evento</h2>

            <input
              className="w-full mb-2 p-2 bg-black border border-zinc-700 rounded"
              value={editingEvent.title}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, title: e.target.value })
              }
            />

            <input
              className="w-full mb-2 p-2 bg-black border border-zinc-700 rounded"
              value={editingEvent.date}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, date: e.target.value })
              }
            />

            <input
              className="w-full mb-4 p-2 bg-black border border-zinc-700 rounded"
              value={editingEvent.dj}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, dj: e.target.value })
              }
            />

            <button
              onClick={async () => {
                await supabase
                  .from("events")
                  .update({
                    title: editingEvent.title,
                    date: editingEvent.date,
                    dj: editingEvent.dj,
                  })
                  .eq("id", editingEvent.id);

                setEditingEvent(null);
                loadEvents();
              }}
              className="bg-green-500 w-full py-2 rounded mb-2"
            >
              Guardar
            </button>

            <button
              onClick={() => setEditingEvent(null)}
              className="bg-zinc-700 w-full py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* NEON */}
      <style>{`
        .neon-text {
          text-shadow: 0 0 10px #ff00ff, 0 0 30px #ff00ff;
        }
      `}</style>
    </div>
  );
}