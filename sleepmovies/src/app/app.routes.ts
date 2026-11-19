import { Routes } from '@angular/router';
import { PeliculasPage } from './pages/peliculas/peliculas';
import { FuncionesPage } from './pages/funciones/funciones';
import { ComprasPage } from './pages/compras/compras';
import { HistorialPage } from './pages/historial/historial';

export const routes: Routes = [
  { path: '', redirectTo: 'peliculas', pathMatch: 'full' },
  { path: 'peliculas', component: PeliculasPage },
  { path: 'funciones', component: FuncionesPage },
  { path: 'compras', component: ComprasPage },
  { path: 'historial', component: HistorialPage },
  { path: '**', redirectTo: 'peliculas' }
];
