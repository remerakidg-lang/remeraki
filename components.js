

/* ReMeraki — componentes reutilizables con Tailwind (Custom Elements, sin build)
 *
 * Reemplazar placeholders:
 *   <rm-image-placeholder src="img/foto.jpg" alt="..."></rm-image-placeholder>
 *   <rm-project-card src="img/proyecto.jpg" ...></rm-project-card>
 * Sin `src` se muestra el placeholder.
 */
(function () {
  "use strict";

  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  class RMElement extends HTMLElement {
    attr(name, fallback = "") {
      return this.hasAttribute(name) ? this.getAttribute(name) : fallback;
    }
    connectedCallback() {
      if (this._content === undefined) this._content = this.innerHTML; // contenido original (slot)
      this.render();
    }
    render() {}
  }
  const define = (tag, cls) => customElements.get(tag) || customElements.define(tag, cls);

  /* Equivalente a useSectionHeight: calcula (alto de ventana - alto del elemento).
   Es negativo cuando el elemento es más alto que la pantalla, y 0 si cabe.
   Útil como `top` en `position: sticky` para que una sección alta se vea
   completa antes de quedarse fija. Devuelve una función para desconectar. */
  function observeSectionHeight(el, onChange, offsetEl) {
    const update = () => {
      const offset = offsetEl ? offsetEl.getBoundingClientRect().height : 0;
      const top = window.innerHeight - el.getBoundingClientRect().height;
      onChange(Math.min(offset, top));
    };
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (offsetEl) observer.observe(offsetEl);   // si el navbar cambia de alto, se recalcula
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }

  /* Contenedor centrado reutilizable */
  const WRAP = "mx-auto max-w-[1280px] px-4 sm:px-10";
  const PROJECT_RATIO = "4/3";

  const ICONS = { 
    be: `<img src="img/be_icono.png" alt="Behance" class="h-5 w-5">`,
    ig: `<img src="img/insta_icono.png" alt="Instagram" class="h-5 w-5">`,
    email: `<img src="img/email_icono.png" alt="Correo electrónico" class="h-5 w-5">`,
    linkedin: `<img src="img/linkedin_icono.png" alt="LinkedIn" class="h-5 w-5">`,
    phone: `<img src="img/telefono_icono.png" alt="Teléfono" class="h-5 w-5">`,
  }

  const IMAGES = {
    simbolo: `<img src="img/ReMeraki_Simbolo.svg" alt="ReMeraki_symbol" class="h-full w-full">`,
    logo: `<img src="img/ReMeraki_Logo.svg" alt="ReMeraki_logo" class="self-center xl:self-end w-full object-contain object-center sm:object-left">`,
    Foto: `<img src="img/foto.png" alt="Foto de Jenn" class="h-full w-full">`,
    Flor: `<img src="img/flor_cara_personaje.svg" alt="Personaje Flor" class="h-full w-full">`,
    FlorVideo: `<img src="img/flor_personaje_videocv.svg" alt="Flor Video" class="h-full w-full">`,
  };

  /* ---------- <rm-logo variant="icon|full"> ---------- */
  define("rm-logo", class extends RMElement {
    render() {
      const full = this.attr("variant") === "full";
      this.className = full
        ? "flex !h-full sm:!h-3/4 justify-self-center sm:justify-self-start sm:col-span-2 w-full "
        : "block";
      this.innerHTML = full
          ? `
            <a href="#inicio" aria-label="ReMeraki, hecho con diseño" class="flex w-full items-center"> 
              ${IMAGES.logo}
            </a>
          `
          : `<a href="#inicio" aria-label="ReMeraki" class="block h-[52px] w-[52px] text-wine">${IMAGES.simbolo}</a>`;
    }
  });

  /* ---------- <rm-image-placeholder src alt label ratio radius shape tone> ---------- */
  define("rm-image-placeholder", class extends RMElement {
    render() {
      const width = this.attr("width", "w-full max-w-[320px]");
      const height = this.attr("height", "h-auto");
      const src = this.attr("src"); // Foto limpia (sin flor) para pantallas grandes
      const srcMobile = this.attr("src-mobile", src); // Foto alternativa o la misma
      const flower = this.attr("flower", "false") === "true"; // Si se quiere la flor encima del marco
      
      if (src) {
        this.innerHTML = `
          <div class="relative ${esc(width)} mx-auto flex flex-col items-center">
            
            <!-- 1. Foto para Escritorio (md en adelante): Ya incluye la composición fija si es necesario -->
            <img 
              src="${esc(src)}" 
              alt="${esc(this.attr("alt"))}" 
              loading="lazy" 
              class="hidden lg:block w-full ${esc(height)} object-contain"
            />

            <!-- 2. Foto para Móvil (lg en adelante): Versión limpia -->
            <div class="relative block lg:hidden w-full ${esc(height)}">
              <img 
                src="${esc(srcMobile)}" 
                alt="${esc(this.attr("alt"))}" 
                loading="lazy" 
                class="w-full h-full object-contain"
              />

              <!-- Flor encima del marco en pantallas móviles -->
              ${flower ? `<div class="absolute -left-4 -bottom-4 z-10 w-24 h-24">
                ${IMAGES.Flor || `<img src="flor.svg" alt="Flor" class="w-full h-full object-contain">`}
              </div>` : ''}
            </div>

          </div>`;
        return;
      }

      const tone = {
        dark: "bg-white/10 text-white/75",
        wine: "bg-wine text-white/80",
      }[this.attr("tone")] || "bg-ph text-[#7c7a55]";

      this.innerHTML = `<div role="img" aria-label="Placeholder: ${esc(this.attr("label", "imagen"))}"
          class="ph grid ${esc(width)} ${esc(height)} place-items-center overflow-hidden p-3 text-center text-sm font-medium ${tone}">
          ${IMAGES.Foto}
        </div>`;
    }
  });

  


  /* ---------- <rm-button href variant="stack" size="sm" type> ---------- */
  define("rm-button", class extends RMElement {
    render() {
      const cls = [
        "inline-block rounded-full bg-olive font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-olive-dark cursor-pointer",
        this.attr("size") === "sm" ? "px-7 py-2" : "px-10 py-2.5",
        this.attr("variant") === "stack" ? "!px-6 !py-3 text-center leading-tight" : "",
      ].join(" ");
      const href = this.attr("href");
      this.innerHTML = href
        ? `<a href="${esc(href)}" class="${cls}">${this._content}</a>`
        : `<button type="${esc(this.attr("type", "button"))}" class="${cls}">${this._content}</button>`;
    }
  });

  /* ---------- <rm-navbar> con <a> hijos ---------- */
define("rm-navbar", class extends RMElement {
  render() {
    this.className = "sticky top-0 z-50 block";

    const tmp = document.createElement("div");
    tmp.innerHTML = this._content;
    const links = [...tmp.querySelectorAll("a")]
      .map((a) => `<li><a href="${esc(a.getAttribute("href"))}" class="nav-link text-lg font-medium text-wine underline-offset-8 hover:underline">${esc(a.textContent)}</a></li>`)
      .join("");

    this.innerHTML = `
      <nav aria-label="Principal" class="bg-cream">
        <div class="${WRAP} flex items-center justify-between gap-6 py-5">
          <rm-logo></rm-logo>
          <button class="nav-toggle text-3xl text-wine md:hidden" aria-label="Abrir menú" aria-expanded="false">☰</button>
          <ul class="nav-links absolute inset-x-0 top-full z-10 hidden flex-col items-center gap-4 bg-cream pb-6 pt-4 shadow-lg
                    md:static md:flex md:flex-1 md:flex-row md:justify-around md:bg-transparent md:p-0 md:shadow-none">${links}</ul>
        </div>
      </nav>
    `;

    const btn = this.querySelector(".nav-toggle");
    const list = this.querySelector(".nav-links");

    const toggle = (open) => {
      list.classList.toggle("hidden", !open);
      list.classList.toggle("flex", open);
      btn.setAttribute("aria-expanded", String(open));
    };

    btn.addEventListener("click", () => toggle(list.classList.contains("hidden")));

    // Solución al scroll bidireccional (arriba y abajo) con elementos sticky
    list.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;

      const targetId = link.getAttribute("href");
      toggle(false); // Cierra menú móvil

      if (targetId && targetId.startsWith("#")) {
        e.preventDefault();

        if (targetId === "#inicio") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          // 1. Seleccionar todas las secciones con clase sticky o componentes que las contienen
          const stickySections = document.querySelectorAll("rm-hero, rm-about, rm-video-intro, rm-portfolio-header, rm-portfolio-sections");

          // 2. Pausar temporalmente el comportamiento sticky
          stickySections.forEach((sec) => {
            sec.style.position = "static";
          });

          // 3. Obtener la posición exacta en el árbol de elementos
          const navbarHeight = this.getBoundingClientRect().height;
          const targetTop = targetSection.getBoundingClientRect().top + window.scrollY - navbarHeight;

          // 4. Realizar el desplazamiento suave
          window.scrollTo({
            top: targetTop,
            behavior: "smooth"
          });

          // 5. Restaurar el comportamiento sticky al finalizar la animación (600ms)
          setTimeout(() => {
            stickySections.forEach((sec) => {
              sec.style.position = "";
            });
          }, 600);
        }
      }
    });
  }
});

  /* ---------- <rm-hero> ---------- */
  define("rm-hero", class extends RMElement {
    render() {
      this.className = "sticky block";  
      this.innerHTML = `<section id="inicio" class=" bg-cream h-auto  sm:h-[65vh] xl:h-[calc(100vh-90px)]">
        <div class="${WRAP} grid h-full grid-rows-2 items-center gap-1 sm:grid-rows-1 sm:grid-cols-5  sm:gap-10">
          <rm-logo variant="full"></rm-logo>
          <div class="hero-text sm:!h-3/4 grid h-full sm:!h-3/4 justify-self-center sm:justify-self-start sm:col-span-3">${this._content}</div>
        </div></section>`;
        
        this._stop?.();
        this._stop = observeSectionHeight(
          this,
          (top) => { this.style.top = `${top}px`; },
          document.querySelector("rm-navbar")        // <- offset
        );
    }
    disconnectedCallback() { this._stop?.(); }
  });

  /* ---------- <rm-about heading role photo photo-label> + <p> ---------- */
  define("rm-about", class extends RMElement {
    render() {
      this.className = "sticky block";

      // Extracción limpia de atributos para simplificar la plantilla
      const heading = esc(this.attr("heading"));
      const role = esc(this.attr("role"));
      const photo = esc(this.attr("photo"));
      const photoMobile = esc(this.attr("photo-mobile", photo)); // Foto alternativa para móviles
      const photoLabel = esc(this.attr("photo-label", "Foto de perfil"));
      const width = esc(this.attr("width"));
      const height = esc(this.attr("height"));
      const flower = this.attr("flower", "false") === "true"; // Si se quiere la flor encima del marco

      this.innerHTML = `
        <section id="sobre-mi" 
          style="background-image: url('img/fondo1.jpg');" 
          class="bg-olive bg-cover bg-center text-cream lg:pb-8 xl:pb-0 h-auto sm:h-[calc(100vh-90px)] md:h-[calc(96vh-90px)] xl:h-[calc(100vh-90px)]">
          <div class="${WRAP} lg:px-0 grid items-center gap-12 py-14 lg:grid-cols-[1.3fr_1fr]">
            <div class="lg:justify-self-end text-center lg:text-right [&_p]:mb-3.5 [&_p]:text-[clamp(1rem,0.66rem+1.06vw,1.5rem)] [&_p]:opacity-90">
              <h2 class="font-display text-cream text-[clamp(1.35rem,0.67rem+2.13vw,3rem)] font-semibold">${heading}</h2>
              <h3 class="mb-5 mt-1 text-cream-soft text-[clamp(1.15rem,0.85rem+0.94vw,2rem)] font-semibold">${role}</h3>
              ${this._content}
            </div>
            <div class="w-full justify-self-center md:justify-self-start">
              <rm-image-placeholder tone="dark" src="${photo}" alt="${heading}" label="${photoLabel}" src-mobile="${photoMobile}" radius="0" width="${width}" height="${height} " flower=${flower}></rm-image-placeholder>
            </div>
          </div>
        </section>`;
          
      this._stop?.();
      this._stop = observeSectionHeight(
        this,
        (top) => { this.style.top = `${top}px`; },
        document.querySelector("rm-navbar") // Offset para navegación pegajosa
      );
    }

    disconnectedCallback() { 
      this._stop?.(); 
    }
  });

  /* ---------- <rm-video-intro heading cv> ---------- */
  define("rm-video-intro", class extends RMElement {
    render() {
      this.className = "sticky block";
      
      const videoSrc = esc(this.attr("video-src")); // URL del video (opcional por ahora)
      const poster = esc(this.attr("poster", "img/ReMeraki_Portada.png")); // Imagen de portada dentro del monitor
      const heading = esc(this.attr("heading", "¡Conóceme mejor!"));
      const cvHref = esc(this.attr("cv", "#"));

      this.innerHTML = `
        <section class="bg-cream px-4 pb-14 pt-14 text-center h-auto sm:h-[calc(100vh-90px)] xl:h-[calc(100vh-90px)] flex flex-col justify-center items-center">
          
          <!-- Contenedor Principal del Monitor -->
          <div class="relative w-full max-w-[520px] mx-auto mb-8">
            
            <!-- 1. Estructura del Monitor -->
            <div class="relative z-10 w-full rounded-[18px] border-[3px] border-olive/30 bg-cream p-3 shadow-sm">
              
              <!-- Pantalla del Monitor -->
              <div class="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-wine flex items-center justify-center">
                ${
                  videoSrc
                    ? `<iframe src="${videoSrc}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>`
                    : `<img src="${poster}" alt="Portada ReMeraki" class="w-full h-full object-cover">
                      <div class="absolute inset-0 flex items-center justify-center bg-black/10 transition hover:bg-black/20 cursor-pointer">
                        <span class="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-wine text-2xl shadow-lg pl-1">▶</span>
                      </div>`
                }
              </div>

              <!-- Cámara del monitor (punto superior) -->
              <div class="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-olive-dark/40"></div>
            </div>

            <!-- Base y Pie del Monitor -->
            <div class="mx-auto h-[40px] w-[80px] bg-wine-dark [clip-path:polygon(30%_0,70%_0,100%_100%,0_100%)]"></div>
            <div class="mx-auto h-[8px] w-[130px] rounded-full bg-wine-dark -mt-1"></div>

            <!-- 2. Personaje con Botas (Más grande y desplazado hacia la derecha) -->
            <div class="absolute -right-12 -bottom-2 sm:-right-24 sm:-bottom-4 z-20 w-44 sm:w-[220px] pointer-events-none">
              ${IMAGES.FlorVideo || `<img src="img/flor_botas_personaje.svg" alt="Personaje ReMeraki" class="w-full h-auto object-contain">`}
            </div>

          </div>

          <!-- Textos y Botón -->
          <h2 class="mb-2 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold text-wine">${heading}</h2>
          <p class="mx-auto mb-6 max-w-[560px] text-[clamp(0.95rem,1.5vw,1.1rem)] text-ink opacity-90 leading-relaxed">${this._content}</p>
          <rm-button size="sm" href="${cvHref}">Descargar CV</rm-button>
          
        </section>`;

      this._stop?.();
      this._stop = observeSectionHeight(
        this,
        (top) => { this.style.top = `${top}px`; },
        document.querySelector("rm-navbar")
      );
    }

    disconnectedCallback() { 
      this._stop?.(); 
    }
  });

  /* ---------- <rm-portfolio-header title subtitle href> ---------- */
  define("rm-portfolio-header", class extends RMElement {
    render() {
      this.className = "sticky block";
      this.innerHTML = `
        <section id="portafolio" class="relative overflow-hidden bg-wine text-cream">
          <!-- Imagen de marcas/símbolos encajada para conservar los bordes -->
          <img 
            src="img/simbolos_portafolio.png" 
            alt="" 
            aria-hidden="true" 
            class="pointer-events-none absolute inset-0 h-full w-full object-contain object-center opacity-90 scale-110 sm:scale-100"
          />

          <!-- Contenido principal -->
          <div class="${WRAP} relative z-10 flex flex-col justify-center py-[72px] h-[calc(100vh-90px)] xl:h-[calc(100vh-90px)]">
            <h2 class="font-display text-[clamp(3.5rem,11vw,9rem)] font-bold leading-none tracking-tighter">${esc(this.attr("title"))}</h2>
            <p class="mb-6 mt-2 font-display text-[clamp(1.1rem,2.5vw,1.8rem)] opacity-90">${esc(this.attr("subtitle"))}</p>
            <rm-button variant="stack" href="${esc(this.attr("href", "#"))}">Descargar<br>portafolio</rm-button>
          </div>
        </section>`;

      this._stop?.();
      this._stop = observeSectionHeight(
        this,
        (top) => { this.style.top = `${top}px`; },
        document.querySelector("rm-navbar")
      );
    }

    disconnectedCallback() { 
      this._stop?.(); 
    }
  });

  /* ---------- <rm-section-title title tone="olive|wine"> ---------- */
  define("rm-section-title", class extends RMElement {
    render() {
      const wine = this.attr("tone", "olive") === "wine";
      this.innerHTML = `<h2 class="px-4 py-2.5 font-display text-2xl font-medium text-cream sm:px-10 ${wine ? "bg-wine text-right" : "bg-olive text-left"}">${esc(this.attr("title"))}</h2>`;
    }
  });

  /* ---------- <rm-project-grid cols="2|3"> ---------- */
  define("rm-project-grid", class extends RMElement {
    connectedCallback() {
      const cols = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3" }[this.attr("cols", "2")];
      this.className = `grid grid-cols-1 items-start gap-6 bg-cream px-4 pb-10 pt-6 sm:px-10 sm:grid-cols-2 ${cols}`;
    }
  });

  /* ---------- <rm-project-card title href src ratio label radius> texto ---------- */
  define("rm-project-card", class extends RMElement {
    render() {
      const text = this._content.trim();
      const ratio = esc(this.attr("ratio", "16/9"));
      const radius = esc(this.attr("radius", "18px"));
      const src = this.attr("src");

      // Con imagen: <img> con proporción fija. Sin imagen: el placeholder de siempre.
      const media = src
        ? `<img src="${esc(src)}" alt="${esc(this.attr("title"))}" loading="lazy"
            style="aspect-ratio:${ratio.replace("/", " / ")};border-radius:${radius}"
            class="block w-full object-cover">`
        : `<rm-image-placeholder ratio="${ratio}" radius="${radius}" width="w-full"
            label="${esc(this.attr("label", "Imagen del proyecto"))}"
            alt="${esc(this.attr("title"))}"></rm-image-placeholder>`;

      this.innerHTML = `<article class="flex flex-col gap-2.5">
        ${media}
        <h3 class="mt-2 text-[.98rem] font-bold leading-snug text-wine">${esc(this.attr("title"))}</h3>
        ${text ? `<p class="text-[.85rem] opacity-85 leading-relaxed">${text}</p>` : ""}
        <a href="${esc(this.attr("href", "#"))}" class="w-fit text-[.85rem] font-semibold text-wine underline underline-offset-4">Ver más</a>
      </article>`;
    }
  });

  /* ---------- <rm-portfolio-sections> ---------- */
  define("rm-portfolio-sections", class extends RMElement {
    render() {
      this.className = "sticky block";
      this.innerHTML = PORTFOLIO_DATA.map((section) => `
        <rm-section-title title="${esc(section.category)}" tone="${esc(section.tone)}"></rm-section-title>
        <rm-project-grid cols="${esc(section.cols)}">
          ${section.projects.map((project) => `
            <rm-project-card
              title="${esc(project.title)}"
              ratio="${PROJECT_RATIO}" 
              radius="20px"
              label="${esc(project.label)}"
              src="${esc(project.src)}"
              href="${esc(project.href)}">
              ${esc(project.description)}
            </rm-project-card>
          `).join("")}
        </rm-project-grid>
      `).join("");
    }
  });

  /* ---------- <rm-contact-form heading> ---------- */
  define("rm-contact-form", class extends RMElement {
    render() {
      this.className = "sticky block";
      const field = "w-full border-2 border-olive bg-cream-soft px-3 py-2.5 font-medium text-ink placeholder:text-olive/85 focus:outline focus:outline-[3px] focus:outline-wine/35";
      const input = (name, type, ph, extra = "") =>
        `<label class="mb-3.5 block"><span class="sr-only">${ph}</span><input name="${name}" type="${type}" placeholder="${ph}" class="${field}" ${extra}></label>`;
      
      const destinationEmail = this.attr("email", "remerakidg@gmail.com");

      this.innerHTML = `<section id="contacto" class="bg-contact px-4 pb-5 pt-14 sm:px-10">
        <div class="mx-auto grid max-w-[1280px] items-end gap-8 md:grid-cols-[1.1fr_1fr]">
          <form action="https://formsubmit.co/${esc(destinationEmail)}" method="POST" novalidate class="max-w-[560px] rounded-[26px] bg-cream px-8 pb-8 pt-7">
            <input type="hidden" name="_captcha" value="false">
            <input type="hidden" name="_template" value="table">
            <input type="hidden" name="_next" value="https://remerakidg-lang.github.io/remeraki/#contacto">

            <h2 class="mb-5 text-center font-display text-[1.7rem] font-semibold text-wine">${esc(this.attr("heading", "¿Trabajamos juntos?"))}</h2>
            ${input("nombre", "text", "Nombre", 'required autocomplete="name"')}
            ${input("correo", "email", "Correo electrónico", 'required autocomplete="email"')}
            ${input("tipo", "text", "Tipo de proyecto")}
            <label class="mb-3.5 block"><span class="sr-only">Cuéntame sobre tu proyecto</span>
              <textarea name="mensaje" required placeholder="Cuéntame sobre tu proyecto" class="${field} min-h-[150px] resize-y"></textarea></label>
            <div class="text-right"><rm-button type="submit">Hagámoslo</rm-button></div>
            <p class="form-ok mt-3 hidden text-center font-semibold text-olive">¡Gracias! Te responderé pronto.</p>
          </form>
          <div class="w-full max-w-[320px] justify-self-center">
            <rm-image-placeholder src="img/personaje3.png" tone="dark" ratio="3/4" label="Ilustración / mascota"></rm-image-placeholder>
          </div>
        </div></section>`;

      const form = this.querySelector("form");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) return form.reportValidity();

        try {
          const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
          });

          if (response.ok) {
            form.querySelector(".form-ok").classList.remove("hidden");
            form.reset();
          }
        } catch (error) {
          console.error("Error al enviar el formulario:", error);
        }
      });
    }
  });

  /* ---------- <rm-footer email phone instagram behance linkedin> ---------- */
  define("rm-footer", class extends RMElement {
  render() {
    this.className = "sticky block";

    const social = (href, label, inner) => `
      <a href="${esc(href || "#")}" 
         aria-label="${label}" 
         target="_blank" 
         rel="noopener" 
         class="inline-flex h-9 w-9 items-center justify-center transition-transform hover:scale-110 [&>img]:h-full [&>img]:w-full [&>img]:object-contain [&>svg]:h-full [&>svg]:w-full">
        ${inner}
      </a>`;

    const email = this.attr("email");
    const phone = this.attr("phone");

    this.innerHTML = `<footer class="bg-wine-dark text-cream">
      <div class="${WRAP} flex flex-wrap items-center justify-center gap-5 py-5 sm:justify-between">
        <div class="flex flex-wrap gap-9">
          <a href="mailto:${esc(email)}" class="inline-flex items-center gap-3 text-[.85rem]">
            <span class="inline-flex h-6 w-6 items-center justify-center [&>svg]:h-full [&>svg]:w-full">${ICONS.email}</span>
            ${esc(email)}
          </a>
          <a href="tel:${esc(phone.replace(/[^+\d]/g, ""))}" class="inline-flex items-center gap-3 text-[.85rem]">
            <span class="inline-flex h-6 w-6 items-center justify-center [&>svg]:h-full [&>svg]:w-full">${ICONS.phone}</span>
            ${esc(phone)}
          </a>
        </div>
        <div class="flex items-center gap-5">
          ${social(this.attr("instagram"), "Instagram", ICONS.ig)}
          ${social(this.attr("behance"), "Behance", ICONS.be)}
          ${social(this.attr("linkedin"), "LinkedIn", ICONS.linkedin)}
        </div>
      </div>
    </footer>`;
  }
});
})();
