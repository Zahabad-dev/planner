import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Obtener proyectos con filtros opcionales
        const { clientName, month, type } = req.query;
        
        let query = supabase
          .from('projects')
          .select(`
            *,
            client:clients(name)
          `)
          .order('fecha_entrega', { ascending: true });

        // Filtrar por cliente
        if (clientName && clientName !== 'todos') {
          const { data: client } = await supabase
            .from('clients')
            .select('id')
            .eq('name', clientName)
            .single();
          
          if (client) {
            query = query.eq('client_id', client.id);
          }
        }

        // Filtrar por tipo
        if (type) {
          query = query.eq('type', type);
        }

        // Filtrar por mes
        if (month) {
          const [year, monthNum] = month.split('-');
          const startDate = `${year}-${monthNum}-01`;
          const endDate = new Date(year, monthNum, 0);
          const endDateStr = `${year}-${monthNum}-${endDate.getDate()}`;
          
          query = query.gte('fecha_entrega', startDate).lte('fecha_entrega', endDateStr);
        }

        const { data: projects, error: getError } = await query;

        if (getError) throw getError;
        return res.status(200).json(projects);

      case 'POST':
        // Crear nuevo proyecto
        const projectData = req.body;
        
        // Obtener el ID del cliente
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('name', projectData.clientName)
          .single();

        if (clientError || !client) {
          return res.status(400).json({ error: 'Cliente no encontrado' });
        }

        const { data: newProject, error: postError } = await supabase
          .from('projects')
          .insert([{
            client_id: client.id,
            type: projectData.type,
            nombre: projectData.nombre,
            fecha_entrega: projectData.fechaEntrega,
            desarrollo: projectData.desarrollo,
            elementos: projectData.elementos,
            guion: projectData.guion,
            duracion: projectData.duracion,
            referencias: projectData.referencias
          }])
          .select(`
            *,
            client:clients(name)
          `)
          .single();

        if (postError) throw postError;
        return res.status(201).json(newProject);

      case 'PUT':
        // Actualizar proyecto
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'ID del proyecto es requerido' });
        }

        const { data: updatedProject, error: putError } = await supabase
          .from('projects')
          .update({
            nombre: updateData.nombre,
            fecha_entrega: updateData.fechaEntrega,
            desarrollo: updateData.desarrollo,
            elementos: updateData.elementos,
            guion: updateData.guion,
            duracion: updateData.duracion,
            referencias: updateData.referencias
          })
          .eq('id', id)
          .select(`
            *,
            client:clients(name)
          `)
          .single();

        if (putError) throw putError;
        return res.status(200).json(updatedProject);

      case 'DELETE':
        // Eliminar proyecto
        const { id: projectId } = req.query;
        
        if (!projectId) {
          return res.status(400).json({ error: 'ID del proyecto es requerido' });
        }

        const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId);

        if (deleteError) throw deleteError;
        return res.status(200).json({ message: 'Proyecto eliminado exitosamente' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error en API projects:', error);
    return res.status(500).json({ error: error.message });
  }
}
