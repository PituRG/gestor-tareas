let idTareaEnEdicion = "";

fetch("https://cqkdlcqlouidhisvxdtf.supabase.co/rest/v1/tareas?select=*", {
  headers: {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2RsY3Fsb3VpZGhpc3Z4ZHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MTY2NTAsImV4cCI6MjA1ODk5MjY1MH0.N-Ef72VOVLtoO7N62NBM6WG4K4EFCxXUHgYA1_r6dIo",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2RsY3Fsb3VpZGhpc3Z4ZHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MTY2NTAsImV4cCI6MjA1ODk5MjY1MH0.N-Ef72VOVLtoO7N62NBM6WG4K4EFCxXUHgYA1_r6dIo"
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://cqkdlcqlouidhisvxdtf.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2RsY3Fsb3VpZGhpc3Z4ZHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MTY2NTAsImV4cCI6MjA1ODk5MjY1MH0.N-Ef72VOVLtoO7N62NBM6WG4K4EFCxXUHgYA1_r6dIo';
  const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey); 

  await cargarTareas(supabaseClient); 
  

  // Seleccionamos el formulario por su id
    const formularioTarea = document.getElementById('formularioTarea');

  // Capturamos el evento "submit" del formulario
  formularioTarea.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que la página se recargue
    await guardarTarea(supabaseClient);  // Llama a la función que guarda la tarea
    formularioTarea.reset(); // Limpia los campos del formulario
  });


    botonCancelar.addEventListener('click', () => {
      // Cancelamos el modo edición
      idTareaEnEdicion = null;

      // Limpiamos el formulario
      formularioTarea.reset();

      // Restauramos el aspecto del botón principal
      botonGuardar.textContent = "Guardar tarea";
      botonCancelar.style.display = "none";
    });

  async function eliminarTarea(id, supabase) {
    const { error } = await supabase
      .from('tareas')
      .delete()
      .eq('id', id); // Elimina la tarea cuyo ID coincida
  
    if (error) {
      console.error('Error al eliminar tarea:', error.message);
      return;
    }
  
    // Volvemos a cargar la lista para que desaparezca la tarea eliminada
    await cargarTareas(supabase);
  }

  async function cargarTareas(supabase) {
    const listadoTareas = document.getElementById('listadoTareas');
  
    const { data: tareas, error } = await supabase
      .from('tareas')
      .select('*');
  
    if (error) {
      listadoTareas.innerHTML = '<p>Error al cargar tareas.</p>';
      console.error(error);
      return;
    }
  
    listadoTareas.innerHTML = ''; // Limpiamos la vista anterior
  
    tareas.forEach(tarea => {
      // Creamos un contenedor div para la tarea
      const contenedor = document.createElement('div');
  
      // Creamos el párrafo con el título
      const pTítulo = document.createElement('h1');
      pTítulo.textContent = tarea.titulo;

      // Creamos el párrafo con la descripción
      const pDescripción = document.createElement('p');
      pDescripción.textContent = tarea.descripción;
  
      // Creamos el botón de eliminar
      const botonEliminar = document.createElement('button');
      botonEliminar.textContent = 'Eliminar';
      
    
      // Al hacer clic, ejecutamos eliminarTarea
      botonEliminar.addEventListener('click', async () => {
        await eliminarTarea(tarea.id, supabase);
      });

      // Botón para editar la tarea
  const botonEditar = document.createElement('button');
  botonEditar.textContent = 'Editar';
  botonEditar.addEventListener('click', () => {
    // Activamos el modo edición guardando el ID de la tarea
    idTareaEnEdicion = tarea.id;

    // Rellenamos el formulario con los datos de la tarea
    formularioTarea.titulo.value = tarea.titulo;
    formularioTarea.descripcion.value = tarea.descripcion || '';
    formularioTarea.fecha.value = tarea.fecha || '';
    //formularioTarea.hora.value = tarea.hora || '';
    formularioTarea.prioridad.value = tarea.prioridad || '';
    formularioTarea.completada.checked = tarea.completada || false;

    // Cambiamos los elementos visuales del formulario
    botonGuardar.textContent = "Guardar cambios";
    botonCancelar.style.display = "inline-block";
  });
  
      // Añadimos el texto y el botón al contenedor div
      contenedor.appendChild(pTítulo);
      contenedor.appendChild(botonEditar);
      contenedor.appendChild(pDescripción);
      contenedor.appendChild(botonEliminar);
      listadoTareas.appendChild(contenedor);
    });
  }
  
  // Función que recoge los datos y los guarda en Supabase
  async function guardarTarea(supabase) {
    const nuevaTarea = {
      titulo: formularioTarea.titulo.value,
      descripcion: formularioTarea.descripcion.value,
      fecha: formularioTarea.fecha.value,
      hora: formularioTarea.hora.value,
      prioridad: parseInt(formularioTarea.prioridad.value),
      completada: formularioTarea.completada.checked
    };

    let resultado;

  if (idTareaEnEdicion) {
    // Estamos editando una tarea existente
    resultado = await supabase
      .from('tareas')
      .update(nuevaTarea)
      .eq('id', idTareaEnEdicion);

    // Salimos del modo edición
    idTareaEnEdicion = null;
  } else {
    // Estamos insertando una tarea nueva
    resultado = await supabase
      .from('tareas')
      .insert([nuevaTarea]);
  }

  if (resultado.error) {
    console.error('Error al guardar tarea:', resultado.error.message);
    return;
  }

  
  // Reiniciamos el formulario y el aspecto visual
  formularioTarea.reset();
  botonGuardar.textContent = "Guardar tarea";
  botonCancelar.style.display = "none";

  await cargarTareas(supabase);

}

})
