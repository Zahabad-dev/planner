import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Formatear fecha completa
const formatFullDate = (dateString) => {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('es-ES', { 
    weekday: 'short',
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Obtener rango de fechas según el tipo
const getDateRange = (type, referenceDate) => {
  const date = new Date(referenceDate + 'T00:00:00');
  
  switch(type) {
    case 'dia':
      return {
        start: referenceDate,
        end: referenceDate
      };
    
    case 'semana':
      const dayOfWeek = date.getDay();
      const startWeek = new Date(date);
      startWeek.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      const endWeek = new Date(startWeek);
      endWeek.setDate(startWeek.getDate() + 6);
      return {
        start: startWeek.toISOString().split('T')[0],
        end: endWeek.toISOString().split('T')[0]
      };
    
    case 'quincena':
      const day = date.getDate();
      const startQuincena = new Date(date.getFullYear(), date.getMonth(), day <= 15 ? 1 : 16);
      const endQuincena = new Date(date.getFullYear(), date.getMonth(), day <= 15 ? 15 : new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate());
      return {
        start: startQuincena.toISOString().split('T')[0],
        end: endQuincena.toISOString().split('T')[0]
      };
    
    case 'mes':
      const startMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return {
        start: startMonth.toISOString().split('T')[0],
        end: endMonth.toISOString().split('T')[0]
      };
    
    default:
      return { start: referenceDate, end: referenceDate };
  }
};

// Filtrar proyectos por rango de fechas
const filterProjectsByDateRange = (projects, start, end) => {
  return projects.filter(project => {
    if (!project.fechaEntrega) return false;
    return project.fechaEntrega >= start && project.fechaEntrega <= end;
  });
};

// Exportar a Excel
export const exportToExcel = (projects, type, referenceDate, clientName) => {
  const range = getDateRange(type, referenceDate);
  const filteredProjects = filterProjectsByDateRange(projects, range.start, range.end);
  
  // Preparar datos para Excel
  const data = filteredProjects.map(project => ({
    'Fecha': formatFullDate(project.fechaEntrega),
    'Cliente': project.cliente,
    'Tipo': project.type.charAt(0).toUpperCase() + project.type.slice(1),
    'Proyecto': project.nombre || 'Sin nombre',
    'Duración': project.duracion || 'No especificada',
    'Desarrollo': project.desarrollo || '',
    'Elementos': project.elementos || '',
    'Guion': project.guion || '',
    'Referencias': project.referencias || ''
  }));
  
  // Crear libro de trabajo
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajustar anchos de columna
  const columnWidths = [
    { wch: 18 }, // Fecha
    { wch: 20 }, // Cliente
    { wch: 12 }, // Tipo
    { wch: 30 }, // Proyecto
    { wch: 15 }, // Duración
    { wch: 40 }, // Desarrollo
    { wch: 30 }, // Elementos
    { wch: 40 }, // Guion
    { wch: 30 }  // Referencias
  ];
  ws['!cols'] = columnWidths;
  
  XLSX.utils.book_append_sheet(wb, ws, 'Proyectos');
  
  // Generar archivo
  const fileName = `Proyectos_${clientName}_${type}_${referenceDate}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// Exportar a PDF con diseño de calendario tipo cuadrícula mensual
export const exportToPDF = (projects, type, referenceDate, clientName) => {
  const range = getDateRange(type, referenceDate);
  const filteredProjects = filterProjectsByDateRange(projects, range.start, range.end);
  
  // Crear documento en orientación horizontal (landscape)
  const doc = new jsPDF('l', 'mm', 'a4');
  
  // Configurar codificación UTF-8
  doc.setProperties({
    title: `Calendario ${clientName}`,
    subject: 'Content Planner',
    author: 'Content Planner System',
    keywords: 'calendario, proyectos, contenido',
    creator: 'Content Planner'
  });
  
  const primaryColor = [102, 126, 234];
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 8;
  
  // Header compacto
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  
  // Obtener el mes y año del rango
  const startDate = new Date(range.start + 'T00:00:00');
  const monthName = startDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  doc.text(monthName.toUpperCase(), pageWidth / 2, 10, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente: ${clientName}`, margin, 18);
  
  // Contador de proyectos
  const totalProjects = filteredProjects.length;
  doc.text(`${totalProjects} proyecto${totalProjects !== 1 ? 's' : ''}`, pageWidth - margin, 18, { align: 'right' });
  
  // Agrupar proyectos por día
  const projectsByDay = {};
  filteredProjects.forEach(project => {
    const day = project.fechaEntrega || 'sin-fecha';
    if (!projectsByDay[day]) {
      projectsByDay[day] = [];
    }
    projectsByDay[day].push(project);
  });
  
  // Generar todos los días del período (mes completo)
  const allDays = [];
  const currentDate = new Date(range.start + 'T00:00:00');
  const endDate = new Date(range.end + 'T00:00:00');
  
  // Si es un mes completo, generar todos los días del mes
  if (type === 'mes') {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      allDays.push(date.toISOString().split('T')[0]);
    }
  } else {
    // Para día, semana, quincena: generar días en el rango
    while (currentDate <= endDate) {
      allDays.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  // Configuración de la cuadrícula
  const startY = 30;
  const availableHeight = pageHeight - startY - 10;
  const availableWidth = pageWidth - (margin * 2);
  
  // Calcular filas y columnas según cantidad de días
  const totalDays = allDays.length;
  let cols = 7; // Por defecto 7 columnas (semana)
  let rows = Math.ceil(totalDays / cols);
  
  // Ajustar para que quepa todo
  if (totalDays <= 7) {
    cols = totalDays;
    rows = 1;
  } else if (totalDays <= 14) {
    cols = 7;
    rows = 2;
  } else {
    cols = 7;
    rows = Math.ceil(totalDays / 7);
  }
  
  const cellWidth = availableWidth / cols;
  const cellHeight = availableHeight / rows;
  
  // Dibujar encabezados de días de la semana
  const weekDays = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 243, 255);
  
  for (let col = 0; col < cols; col++) {
    const x = margin + (col * cellWidth);
    doc.rect(x, startY, cellWidth, 8, 'F');
    doc.setTextColor(60, 60, 60);
    doc.text(weekDays[col % 7], x + cellWidth / 2, startY + 5.5, { align: 'center' });
  }
  
  // Dibujar cuadrícula de calendario
  let dayIndex = 0;
  const calendarStartY = startY + 8;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (dayIndex >= totalDays) break;
      
      const dateStr = allDays[dayIndex];
      const date = new Date(dateStr + 'T00:00:00');
      const dayNumber = date.getDate();
      const dayOfWeek = date.getDay();
      
      const x = margin + (col * cellWidth);
      const y = calendarStartY + (row * cellHeight);
      
      // Fondo de la celda
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (isWeekend) {
        doc.setFillColor(250, 250, 250);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(x, y, cellWidth, cellHeight, 'F');
      
      // Borde de la celda
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(x, y, cellWidth, cellHeight, 'S');
      
      // Número del día
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      // Verificar si hay proyectos este día
      const dayProjects = projectsByDay[dateStr] || [];
      const hasProjects = dayProjects.length > 0;
      
      if (hasProjects) {
        // Día con proyectos - fondo de color
        doc.setFillColor(...primaryColor);
        doc.circle(x + 5, y + 4, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(dayNumber.toString(), x + 5, y + 5.5, { align: 'center' });
        
        // Contador de proyectos
        doc.setFontSize(6);
        doc.setTextColor(0, 0, 0);
        doc.text(`${dayProjects.length}`, x + cellWidth - 3, y + 4, { align: 'right' });
      } else {
        // Día sin proyectos
        doc.setTextColor(150, 150, 150);
        doc.text(dayNumber.toString(), x + 3, y + 5);
      }
      
      // Mostrar proyectos del día (compacto)
      if (hasProjects) {
        let projectY = y + 9;
        const maxProjects = Math.floor((cellHeight - 10) / 6);
        const iconsType = { reels: 'R', post: 'P', historias: 'H', carrusel: 'C', tiktok: 'T' };
        
        dayProjects.slice(0, maxProjects).forEach((project, idx) => {
          // Icono del tipo
          doc.setFontSize(5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...primaryColor);
          doc.text(iconsType[project.type] || 'X', x + 2, projectY);
          
          // Nombre del proyecto (muy resumido)
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          const projectName = project.nombre || 'Sin nombre';
          const maxChars = Math.floor(cellWidth / 1.5);
          const displayName = projectName.length > maxChars ? projectName.substring(0, maxChars - 2) + '..' : projectName;
          doc.text(displayName, x + 5, projectY);
          
          projectY += 5.5;
        });
        
        // Indicador de más proyectos
        if (dayProjects.length > maxProjects) {
          doc.setFontSize(5);
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'italic');
          doc.text(`+${dayProjects.length - maxProjects}`, x + 2, projectY);
        }
      }
      
      dayIndex++;
    }
  }
  
  // Leyenda de tipos en el footer
  const legendY = pageHeight - 6;
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Tipos: R=Reels | P=Post | H=Historias | C=Carrusel | T=TikTok', margin, legendY);
  
  doc.setTextColor(128, 128, 128);
  doc.text(new Date().toLocaleDateString('es-ES'), pageWidth / 2, legendY, { align: 'center' });
  doc.text('Content Planner', pageWidth - margin, legendY, { align: 'right' });
  
  // Guardar PDF
  const fileName = `Calendario_${clientName}_${monthName.replace(/\s/g, '_')}.pdf`;
  doc.save(fileName);
};
