import { supabase } from './supabase';

// ==================== CLIENTES ====================

export const fetchClients = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
};

export const addClient = async (name) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding client:', error);
    return { success: false, error: error.message };
  }
};

export const deleteClient = async (name) => {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('name', name);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting client:', error);
    return { success: false, error: error.message };
  }
};

// ==================== PROYECTOS ====================

export const fetchProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(name)
      `)
      .order('fecha_entrega', { ascending: true });

    if (error) throw error;
    
    console.log('📥 PROYECTOS CRUDOS DE SUPABASE:', data);
    
    // Transformar datos para el formato esperado por el frontend
    const projects = {
      reels: [],
      post: [],
      historias: [],
      carrusel: [],
      tiktok: []
    };

    (data || []).forEach(project => {
      const type = project.type;
      if (projects[type]) {
        const transformedProject = {
          id: project.id,
          cliente: project.client?.name || '',
          nombre: project.nombre || '',
          fechaEntrega: project.fecha_entrega || '',
          desarrollo: project.desarrollo || '',
          elementos: project.elementos || '',
          guion: project.guion || '',
          duracion: project.duracion || '',
          referencias: project.referencias || ''
        };
        console.log(`🔄 Transformando proyecto ${type}:`, transformedProject);
        projects[type].push(transformedProject);
      }
    });

    console.log('✅ PROYECTOS TRANSFORMADOS:', projects);
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      reels: [],
      post: [],
      historias: [],
      carrusel: [],
      tiktok: []
    };
  }
};

export const addProject = async (type, projectData, clientName) => {
  try {
    // Obtener el ID del cliente
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('name', clientName)
      .single();

    if (clientError || !client) {
      throw new Error('Cliente no encontrado');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        client_id: client.id,
        type: type,
        nombre: projectData.nombre || '',
        fecha_entrega: projectData.fechaEntrega || null,
        desarrollo: projectData.desarrollo || '',
        elementos: projectData.elementos || '',
        guion: projectData.guion || '',
        duracion: projectData.duracion || '',
        referencias: projectData.referencias || ''
      }])
      .select(`
        *,
        client:clients(name)
      `)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        id: data.id,
        cliente: data.client?.name || '',
        nombre: data.nombre || '',
        fechaEntrega: data.fecha_entrega || '',
        desarrollo: data.desarrollo || '',
        elementos: data.elementos || '',
        guion: data.guion || '',
        duracion: data.duracion || '',
        referencias: data.referencias || ''
      }
    };
  } catch (error) {
    console.error('Error adding project:', error);
    return { success: false, error: error.message };
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    console.log('📤 ENVIANDO A SUPABASE:', {
      projectId,
      datosAEnviar: {
        nombre: projectData.nombre || '',
        fecha_entrega: projectData.fechaEntrega || null,
        desarrollo: projectData.desarrollo || '',
        elementos: projectData.elementos || '',
        guion: projectData.guion || '',
        duracion: projectData.duracion || '',
        referencias: projectData.referencias || ''
      }
    });

    const { data, error } = await supabase
      .from('projects')
      .update({
        nombre: projectData.nombre || '',
        fecha_entrega: projectData.fechaEntrega || null,
        desarrollo: projectData.desarrollo || '',
        elementos: projectData.elementos || '',
        guion: projectData.guion || '',
        duracion: projectData.duracion || '',
        referencias: projectData.referencias || ''
      })
      .eq('id', projectId)
      .select(`
        *,
        client:clients(name)
      `)
      .single();

    if (error) throw error;

    console.log('📥 RECIBIDO DE SUPABASE:', data);

    return {
      success: true,
      data: {
        id: data.id,
        cliente: data.client?.name || '',
        nombre: data.nombre || '',
        fechaEntrega: data.fecha_entrega || '',
        desarrollo: data.desarrollo || '',
        elementos: data.elementos || '',
        guion: data.guion || '',
        duracion: data.duracion || '',
        referencias: data.referencias || ''
      }
    };
  } catch (error) {
    console.error('Error updating project:', error);
    return { success: false, error: error.message };
  }
};

export const deleteProject = async (projectId) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: error.message };
  }
};
