import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import Chart from 'chart.js/auto';
import { EstadisticasService } from '../../servicios/estadisticas';
import { mensajeDeError } from '../../utilidades/mensaje-de-error';

const COLORES = {
  brasa: '#ea580c',
  dorado: '#c9a24d',
  ambar: '#fbbf24',
  textoSuave: '#a8998a',
  borde: '#3a3026',
  superficie: '#1c1814',
};

const COLORES_TORTA = [
  '#ea580c',
  '#c9a24d',
  '#fbbf24',
  '#f97316',
  '#86c26b',
  '#b45309',
  '#e8dcc4',
  '#7c2d12',
  '#a8998a',
  '#facc15',
];

const DIAS_POR_DEFECTO = 30;

Chart.defaults.color = COLORES.textoSuave;
Chart.defaults.borderColor = COLORES.borde;
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";

@Component({
  selector: 'app-dashboard-estadisticas',
  styleUrl: './dashboard-estadisticas.css',
  templateUrl: './dashboard-estadisticas.html',
})

export class DashboardEstadisticas implements OnInit, OnDestroy {
  private estadisticasService = inject(EstadisticasService);

  @ViewChild('lienzoUsuarios', { static: true }) lienzoUsuarios!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lienzoDias', { static: true }) lienzoDias!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lienzoPublicaciones', { static: true }) lienzoPublicaciones!: ElementRef<HTMLCanvasElement>;

  private graficos: Chart[] = [];

  desde = signal(this.aTexto(this.haceDias(DIAS_POR_DEFECTO - 1)));
  hasta = signal(this.aTexto(new Date()));

  cargando = signal(false);
  error = signal<string | null>(null);

  sinPublicaciones = signal(false);
  sinComentarios = signal(false);

  ngOnInit() {
    this.ver();
  }

  ngOnDestroy() {
    this.borrarGraficos();
  }

  cambiarDesde(evento: Event) {
    this.desde.set((evento.target as HTMLInputElement).value);
  }

  cambiarHasta(evento: Event) {
    this.hasta.set((evento.target as HTMLInputElement).value);
  }

  async ver() {
    const desde = this.desde();
    const hasta = this.hasta();

    if (!desde || !hasta) {
      this.error.set('Elegí las dos fechas');
      return;
    }

    if (desde > hasta) {
      this.error.set('La fecha desde no puede ser posterior a la fecha hasta');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    try {
      const [porUsuario, porDia, porPublicacion] = await Promise.all([
        this.estadisticasService.publicacionesPorUsuario(desde, hasta),
        this.estadisticasService.comentariosPorDia(desde, hasta),
        this.estadisticasService.comentariosPorPublicacion(desde, hasta),
      ]);

      this.borrarGraficos();

      this.sinPublicaciones.set(porUsuario.length === 0);
      this.sinComentarios.set(porPublicacion.length === 0);

      this.graficos.push(
        new Chart(this.lienzoUsuarios.nativeElement, {
          type: 'bar',
          data: {
            labels: porUsuario.map((fila) => fila.nombreUsuario),
            datasets: [
              {
                label: 'Publicaciones',
                data: porUsuario.map((fila) => fila.cantidad),
                backgroundColor: 'rgba(234, 88, 12, 0.55)',
                borderColor: COLORES.brasa,
                borderWidth: 1,
                borderRadius: 6,
              },
            ],
          },
          options: {
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          },
        }),
      );

      this.graficos.push(
        new Chart(this.lienzoDias.nativeElement, {
          type: 'line',
          data: {
            labels: porDia.map((fila) => `${fila.dia.slice(8, 10)}/${fila.dia.slice(5, 7)}`),
            datasets: [
              {
                label: 'Comentarios',
                data: porDia.map((fila) => fila.cantidad),
                borderColor: COLORES.dorado,
                backgroundColor: 'rgba(201, 162, 77, 0.15)',
                pointBackgroundColor: COLORES.ambar,
                fill: true,
                tension: 0.3,
              },
            ],
          },
          options: {
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          },
        }),
      );

      this.graficos.push(
        new Chart(this.lienzoPublicaciones.nativeElement, {
          type: 'pie',
          data: {
            labels: porPublicacion.map((fila) => fila.titulo),
            datasets: [
              {
                data: porPublicacion.map((fila) => fila.cantidad),
                backgroundColor: porPublicacion.map((_, i) => COLORES_TORTA[i % COLORES_TORTA.length]),
                borderColor: COLORES.superficie,
                borderWidth: 2,
              },
            ],
          },
          options: {
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
          },
        }),
      );
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  private borrarGraficos() {
    this.graficos.forEach((grafico) => grafico.destroy());
    this.graficos = [];
  }

  private haceDias(cantidad: number) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - cantidad);
    return fecha;
  }

  private aTexto(fecha: Date) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
