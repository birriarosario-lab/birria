// BIRRIA PRO MAX FINALconst [isAdmin, setIsAdmin] = useState(false);
// React + Tailwind + Supabase + Cloudinary + Tickets

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// 🔑 SUPABASE
const supabase = createClient(
  "https://ndfyprlotymizqyvdzsx.supabase.co",
  "sb_publishable_dgrq5VEKaSSbkrR2i-tiFw_ZGsHfDuJ"
);

export default function App() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
  loadEvents();

  if (window.location.pathname === "/admin") {
    setIsAdmin(true);
  }
}, []);

  // 📥 CARGAR EVENTOS
  {isAdmin && (
  <div className="flex gap-2 mt-2">
    <button
      onClick={() => editEvent(ev)}
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
const deleteEvent = async (id) => {
  await supabase.from("events").delete().eq("id", id);
  loadEvents();
};
const deleteEvent = async (id) => {
  await supabase.from("events").delete().eq("id", id);
  loadEvents();
};
  const loadEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("id", { ascending: false });
    setEvents(data || []);
  };

  // 📤 SUBIR FLYERS (CLOUDINARY)
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

  // 💰 LINK DE PAGO
  const createPaymentLink = (event) => {
    return `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=link.mercadopago.com.ar/ticketsbirria`;
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO */}
<section className="h-[60vh] flex flex-col items-center justify-center gap-6">
  <h1 className="text-7xl neon-text">BIRRIA</h1>

  {/* DROP ZONE */}
  <div
    onDragOver={(e) => e.preventDefault()}
    onDrop={handleDrop}
    className="border-2 border-dashed border-pink-500 p-10 text-center rounded-xl"
  >
    Arrastrá flyers acá 🔥
  </div>
</section>

      {/* DROP ZONE */}
    

      {/* EVENTS */}
      <section className="p-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {events.map((ev) => (
          <div
            key={ev.id}
            onClick={() => setSelected(ev)}
            className="cursor-pointer hover:scale-105 transition"
          >
            <img src={ev.image} className="rounded-xl mb-2" />
            <p className="font-bold">{ev.title}</p>
            <p className="text-sm text-zinc-400">{ev.date}</p>
          </div>
        ))}
      </section>

      {/* MODAL */}
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

            {/* COMPRAR */}
            <a
              href={createPaymentLink(selected)}
              target="_blank"
              className="block text-center bg-yellow-500 py-3 rounded-xl font-bold mb-3"
            >
              Comprar Entrada
            </a>

            {/* WHATSAPP */}
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

      {/* NEON STYLE */}
      <style>{`
        .neon-text {
          text-shadow: 0 0 10px #ff00ff, 0 0 30px #ff00ff;
        }
      `}</style>
    </div>
  );
}
