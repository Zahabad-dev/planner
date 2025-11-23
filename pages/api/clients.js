import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Obtener todos los clientes
        const { data: clients, error: getError } = await supabase
          .from('clients')
          .select('*')
          .order('name', { ascending: true });

        if (getError) throw getError;
        return res.status(200).json(clients);

      case 'POST':
        // Crear nuevo cliente
        const { name } = req.body;
        
        if (!name) {
          return res.status(400).json({ error: 'El nombre del cliente es requerido' });
        }

        const { data: newClient, error: postError } = await supabase
          .from('clients')
          .insert([{ name }])
          .select()
          .single();

        if (postError) throw postError;
        return res.status(201).json(newClient);

      case 'DELETE':
        // Eliminar cliente por nombre
        const { name: clientName } = req.query;
        
        if (!clientName) {
          return res.status(400).json({ error: 'El nombre del cliente es requerido' });
        }

        const { error: deleteError } = await supabase
          .from('clients')
          .delete()
          .eq('name', clientName);

        if (deleteError) throw deleteError;
        return res.status(200).json({ message: 'Cliente eliminado exitosamente' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error en API clients:', error);
    return res.status(500).json({ error: error.message });
  }
}
