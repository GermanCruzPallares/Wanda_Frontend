
// Espera a que todo el contenido del DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  // Selecciona todas las tarjetas del slider
  const slides = document.querySelectorAll('.features__card')

  // Selecciona todos los puntos indicadores del slider
  const dots = document.querySelectorAll('.features__dot')

  // Índice que indica qué slide está activo actualmente
  let currentIndex = 0

  // Función que muestra un slide según el índice recibido
  function showSlide(index) {
    // Si el índice se pasa del último slide, vuelve al primero
    if (index >= slides.length) {
      currentIndex = 0

      // Si el índice es menor que 0, va al último slide
    } else if (index < 0) {
      currentIndex = slides.length - 1

      // Si está dentro de rangos, simplemente actualiza el índice
    } else {
      currentIndex = index
    }

    // Quita la clase "active" de todos los slides
    slides.forEach((slide) => slide.classList.remove('active'))

    // Quita la clase "active" de todos los puntos
    dots.forEach((dot) => dot.classList.remove('active'))

    // Activa solo el slide actual
    slides[currentIndex].classList.add('active')

    // Activa el punto correspondiente al slide actual
    dots[currentIndex].classList.add('active')
  }

  // Permite cambiar a un slide específico desde el HTML
  window.currentSlide = function (index) {
    showSlide(index)
  }

  // Cambia al siguiente slide
  window.nextSlide = function () {
    showSlide(currentIndex + 1)
  }

  // Cambia al slide anterior
  window.prevSlide = function () {
    showSlide(currentIndex - 1)
  }
})
