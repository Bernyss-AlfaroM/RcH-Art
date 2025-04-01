'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firestore } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import styles from './DataTableView.module.css';

const DataTableView = () => {
  const [pedidos, setPedidos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editForm, setEditForm] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [loading, setLoading] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  
  // Estados para la selección de celdas
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  
  // Ref para el textarea oculto que usaremos para copiar
  const textAreaRef = useRef(null);
  
  // Listas predefinidas
  const encargadosList = ["Bernyss", "Brayan", "Stephanie"];
  const generoList = ["Hombre", "Mujer"];
  const marcaList = ["Okey", "Columbia", "Unicreses"];
  const turnoList = ["A", "B", "C"];
  const tallaList = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  
  // Lista de estados
  const estadosList = ["Pendiente", "Faltante", "Comprada", "Pagada", "Bordada", "Entregada"];
  
  // Función para formatear fechas
  const [user, setUser] = useState(null);
  const formatDate = (date) => {
    if (!date) return '';
    if (date && date.toDate) {
      return date.toDate().toISOString().slice(0, 10);
    }
    if (typeof date === 'string') {
      return date;
    }
    return '';
  };
  
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/Views');
      } else {
        setUser(user);
      }
    });
    return unsubscribe;
  }, [router]);
  
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const pedidosSnapshot = await getDocs(collection(firestore, 'Ventas'));
        const pedidosData = pedidosSnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Determinar el estado actual basado en los campos existentes
          let estado = "Pendiente";
          if (data.entregada) estado = "Entregada";
          else if (data.bordada) estado = "Bordada";
          else if (data.pagadas) estado = "Pagada";
          else if (data.compradas) estado = "Comprada";
          else if (data.faltantes) estado = "Faltante";
          
          return {
            id: doc.id,
            ...data,
            fechaPedido: formatDate(data.fechaPedido),
            estado: data.estado || estado,
            persona: data.persona || '',
            encargadoPor: data.encargadoPor || encargadosList[0],
            pago: data.pago || '',
            turno: data.turno || turnoList[0],
            empresa: data.empresa || '',
            colores: data.colores || '',
            marca: data.marca || marcaList[0],
            talla: data.talla || tallaList[0],
            genero: data.genero || generoList[0],
            comentarios: data.comentarios || ''
          };
        });
        setPedidos(pedidosData);
      } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        alert('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);
  
  // Nueva función para obtener la clase de estado
  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Faltante': return styles.statusRed;
      case 'Comprada': return styles.statusYellow;
      case 'Pagada': return styles.statusBlue;
      case 'Bordada': return styles.statusPurple;
      case 'Entregada': return styles.statusGreen;
      case 'Pendiente': return styles.statusPending;
      default: return '';
    }
  };
  
  // Función para determinar si un estado debe parpadear
  const shouldBlink = (estado) => {
    return estado === 'Pendiente' || estado === 'Faltante';
  };
  
  // Función para eliminar un pedido
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      try {
        await deleteDoc(doc(firestore, 'Ventas', id));
        setPedidos(pedidos.filter(pedido => pedido.id !== id));
        alert('Pedido eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el pedido');
      }
    }
  };
  
  // Funciones para edición
  const startEditing = (pedido) => {
    setEditingId(pedido.id);
    setEditForm(pedido);
  };
  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEditSubmit = async () => {
    try {
      const pedidoRef = doc(firestore, 'Ventas', editingId);
      
      // Preparar datos para actualizar en Firestore
      const updateData = {
        ...editForm,
        fechaPedido: editForm.fechaPedido || '',
        estado: editForm.estado || 'Pendiente',
        // Actualizar los campos antiguos para compatibilidad con código existente
        faltantes: editForm.estado === 'Faltante',
        compradas: editForm.estado === 'Comprada',
        pagadas: editForm.estado === 'Pagada',
        bordada: editForm.estado === 'Bordada',
        entregada: editForm.estado === 'Entregada'
      };
      
      await updateDoc(pedidoRef, updateData);
      setPedidos(pedidos.map(pedido => 
        pedido.id === editingId ? {...pedido, ...updateData} : pedido
      ));
      setEditingId(null);
      alert('Pedido actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert('Error al actualizar el pedido');
    }
  };
  
  // Función para ordenar
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    const sortedPedidos = [...pedidos].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setPedidos(sortedPedidos);
  };
  
  // Filtrar pedidos según término de búsqueda y estado seleccionado
  const filteredPedidos = pedidos.filter(pedido => {
    const searchMatch = searchTerm ? (
      pedido.persona?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.encargadoPor?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true;
    
    // Filtro por estado
    const estadoMatch = estadoFilter === 'Todos' || pedido.estado === estadoFilter;
    
    return searchMatch && estadoMatch;
  });
  
  // Manejar cambio de filtro por estado
  const handleEstadoFilterChange = (e) => {
    setEstadoFilter(e.target.value);
  };
  
  // Función para manejar la selección de un item
  const toggleSelectItem = (id) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Función para seleccionar/deseleccionar todos los items
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newSelectedItems = {};
    filteredPedidos.forEach(pedido => {
      newSelectedItems[pedido.id] = newSelectAll;
    });
    
    setSelectedItems(newSelectedItems);
  };
  
  // Función para copiar los datos seleccionados
  const copySelectedItems = () => {
    // Obtener los items seleccionados
    const selectedPedidos = filteredPedidos.filter(pedido => selectedItems[pedido.id]);
    
    if (selectedPedidos.length === 0) {
      alert('Por favor selecciona al menos un pedido para copiar');
      return;
    }
    
    // Formatear los datos en el orden especificado: color, marca, talla y género
    const copyText = selectedPedidos.map(pedido => 
      `${pedido.colores},${pedido.marca},${pedido.talla},${pedido.genero}`
    ).join('\n');
    
    // Copiar al portapapeles
    if (textAreaRef.current) {
      textAreaRef.current.value = copyText;
      textAreaRef.current.select();
      document.execCommand('copy');
      alert(`${selectedPedidos.length} pedidos copiados al portapapeles`);
    }
  };
  
  if (loading) {
    return <div className={styles.loadingContainer}>Cargando datos...</div>;
  }
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Lista de Pedidos</h2>
      
      {/* Barra de búsqueda y filtros */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          placeholder="Buscar por persona, empresa o encargado..."
          className={`${styles.dataTableSearch} flex-grow`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {/* Filtro por estado */}
        <div className="flex items-center">
          <label htmlFor="estadoFilter" className="mr-2 font-medium">Filtrar por estado:</label>
          <select
            id="estadoFilter"
            value={estadoFilter}
            onChange={handleEstadoFilterChange}
            className={`${styles.formSelect} min-w-[150px]`}
          >
            <option value="Todos">Todos</option>
            {estadosList.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Contador de resultados y botones de acción */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          Mostrando {filteredPedidos.length} de {pedidos.length} pedidos
          {estadoFilter !== 'Todos' ? ` (filtrado por: ${estadoFilter})` : ''}
        </p>
        
        {/* Botones para seleccionar todos y copiar */}
        <div className="flex space-x-2">
          <button
            onClick={toggleSelectAll}
            className={`${styles.button} ${styles.buttonBlue}`}
          >
            {selectAll ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
          </button>
          <button
            onClick={copySelectedItems}
            className={`${styles.button} ${styles.buttonGreen}`}
          >
            Copiar Seleccionados
          </button>
        </div>
      </div>
      
      {/* TextArea oculto para copiar */}
      <textarea 
        ref={textAreaRef}
        style={{ position: 'absolute', left: '-9999px' }}
        readOnly
      />
      
      {/* Tabla de datos */}
      <div className={styles.dataTableContainer}>
        <table className={styles.dataTable}>
          <thead className={styles.dataTableHeader}>
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="h-4 w-4"
                />
              </th>
              {[
                'Persona', 'Encargado', 'Pago', 'Fecha', 'Turno', 'Empresa',
                'Colores', 'Marca', 'Talla', 'Género', 'Estado', 'Acciones'
              ].map((header) => (
                <th 
                  key={header}
                  onClick={() => handleSort(header.toLowerCase())}
                  className="cursor-pointer hover:bg-gray-200"
                >
                  {header}
                  {sortConfig.key === header.toLowerCase() && (
                    <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.length > 0 ? (
              filteredPedidos.map((pedido) => (
                <tr key={pedido.id} className={styles.dataTableRow}>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!selectedItems[pedido.id]}
                      onChange={() => toggleSelectItem(pedido.id)}
                      className="h-4 w-4"
                    />
                  </td>
                  {editingId === pedido.id ? (
                    <>
                      <td className={`px-6 py-4 ${getEstadoClass(editForm.estado)}`}>
                        <input
                          type="text"
                          name="persona"
                          value={editForm.persona}
                          onChange={handleEditChange}
                          className={`${styles.formInput} ${shouldBlink(editForm.estado) ? styles.blinkAnimation : ''}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          name="encargadoPor"
                          value={editForm.encargadoPor}
                          onChange={handleEditChange}
                          className={styles.formSelect}
                        >
                          {encargadosList.map(enc => (
                            <option key={enc} value={enc}>{enc}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          name="pago"
                          value={editForm.pago}
                          onChange={handleEditChange}
                          className={styles.formInput}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="date"
                          name="fechaPedido"
                          value={editForm.fechaPedido}
                          onChange={handleEditChange}
                          className={styles.formInput}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          name="turno"
                          value={editForm.turno}
                          onChange={handleEditChange}
                          className={styles.formSelect}
                        >
                          {turnoList.map(turno => (
                            <option key={turno} value={turno}>{turno}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="empresa"
                          value={editForm.empresa}
                          onChange={handleEditChange}
                          className={styles.formInput}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="colores"
                          value={editForm.colores}
                          onChange={handleEditChange}
                          className={styles.formInput}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          name="marca"
                          value={editForm.marca}
                          onChange={handleEditChange}
                          className={styles.formSelect}
                        >
                          {marcaList.map(marca => (
                            <option key={marca} value={marca}>{marca}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          name="talla"
                          value={editForm.talla}
                          onChange={handleEditChange}
                          className={styles.formSelect}
                        >
                          {tallaList.map(talla => (
                            <option key={talla} value={talla}>{talla}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          name="genero"
                          value={editForm.genero}
                          onChange={handleEditChange}
                          className={styles.formSelect}
                        >
                          {generoList.map(genero => (
                            <option key={genero} value={genero}>{genero}</option>
                          ))}
                        </select>
                      </td>
                      <td className={`px-6 py-4 ${getEstadoClass(editForm.estado)} ${shouldBlink(editForm.estado) ? styles.blinkAnimation : ''}`}>
                        <select
                          name="estado"
                          value={editForm.estado}
                          onChange={handleEditChange}
                          className={styles.formSelect}
                        >
                          {estadosList.map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={handleEditSubmit}
                            className={`${styles.button} ${styles.buttonGreen}`}
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className={`${styles.button} ${styles.buttonGray}`}
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className={`border border-white-300 px-4 py-2 ${getEstadoClass(pedido.estado)} ${shouldBlink(pedido.estado) ? styles.blinkAnimation : ''}`}>{pedido.persona}</td>
                      <td className={`border border-white-300 px-4 py-2 ${getEstadoClass(pedido.estado)} ${shouldBlink(pedido.estado) ? styles.blinkAnimation : ''}`}>{pedido.encargadoPor}</td>
                      <td className={`border border-white-300 px-4 py-2 ${getEstadoClass(pedido.estado)} ${shouldBlink(pedido.estado) ? styles.blinkAnimation : ''}`}>₡{pedido.pago}</td>
                      <td className={`border border-white-300 px-4 py-2 ${getEstadoClass(pedido.estado)} ${shouldBlink(pedido.estado) ? styles.blinkAnimation : ''}`}>{pedido.fechaPedido}</td>
                      <td className={`border border-white-300 px-4 py-2 ${getEstadoClass(pedido.estado)} ${shouldBlink(pedido.estado) ? styles.blinkAnimation : ''}`}>{pedido.turno}</td>
                      <td className={`border border-white-300 px-4 py-2 ${getEstadoClass(pedido.estado)} ${shouldBlink(pedido.estado) ? styles.blinkAnimation : ''}`}>{pedido.empresa}</td>
                      <td className={`border border-white-300 px-4 py-2 ${getEstadoClass(pedido.estado)} ${shouldBlink(pedido.estado) ? styles.blinkAnimation : ''}`}>{pedido.colores}</td>
                      <td className={`border border-white-300 px-4 py-2 ${getEstadoClass(pedido.estado)} ${shouldBlink(pedido.estado) ? styles.blinkAnimation : ''}`}>{pedido.marca}</td>
                      <td className={`border border-white-300 px-4 py-2 ${getEstadoClass(pedido.estado)} ${shouldBlink(pedido.estado) ? styles.blinkAnimation : ''}`}>{pedido.talla}</td>
                      <td className={`border border-white-300 px-4 py-2 ${getEstadoClass(pedido.estado)} ${shouldBlink(pedido.estado) ? styles.blinkAnimation : ''}`}>{pedido.genero}</td>
                      <td className={`border border-white-300 px-4 py-2 ${getEstadoClass(pedido.estado)} ${shouldBlink(pedido.estado) ? styles.blinkAnimation : ''}`}>{pedido.estado}</td>
                      <td className="border border-white-300 px-4 py-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(pedido)}
                            className={`${styles.button} ${styles.buttonBlue}`}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(pedido.id)}
                            className={`${styles.button} ${styles.buttonRed}`}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="px-6 py-4 text-center text-gray-500">
                  No se encontraron pedidos con los filtros seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTableView;