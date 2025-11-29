async function cargarLavados() {
    try {
        const res = await fetch('http://localhost:3000/api/lavados');

        const lavados = await res.json();

        const cards = [
            {
                img: document.getElementById('card1-img'),
                name: document.getElementById('card1-name'),
                price: document.getElementById('card1-price')
            },
            {
                img: document.getElementById('card2-img'),
                name: document.getElementById('card2-name'),
                price: document.getElementById('card2-price')
            },
            {
                img: document.getElementById('card3-img'),
                name: document.getElementById('card3-name'),
                price: document.getElementById('card3-price')
            }
        ];

        const RUTAS_BASE_IMAGENES = '../utils/';

        lavados.forEach((lavado, index) => {
            const card = cards[index];
            if(!card) return;

            card.name.textContent = `${lavado.precio.toFixed(2)}`; // formatea con 2 decimales (en la bd se guardo como un flotante)

            const rutaImagen = RUTAS_BASE_IMAGENES + lavado.imagen;
            card.img.style.backgroundImage = `url(${rutaImagen})`;
            card.img.style.backgroundSize = 'cover';
            card.img.style.backgroundPosition = 'center';
        });

    } catch (err) {
        console.error("Error al cargar los lavados en el front", err);
    }
}

document.addEventListener('DOMContentLoaded', cargarLavados);