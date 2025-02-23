'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firestore } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const DataTableView = () => {
  const [pedidos, setPedidos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editForm, setEditForm] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [loading, setLoading] = useState(true);

  // Listas predefinidas
  const encargadosList = ["Bernyss", "Brayan", "Stephanie"];
  const generoList = ["Hombre", "Mujer"];
  const marcaList = ["Okey", "Columbia", "Unicreses"];
  const turnoList = ["A", "B", "C"];
  const tallaList = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

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
        return {
          id: doc.id,
          ...data,
          fechaPedido: formatDate(data.fechaPedido),
          faltantes: !!data.faltantes,
          compradas: !!data.compradas,
          pagadas: !!data.pagadas,
          bordada: !!data.bordada,
          entregada: !!data.entregada,
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

  

  const getRowColor = (pedido) => {
    if (pedido.faltantes) return 'bg-red-200';
    if (pedido.compradas) return 'bg-yellow-200';
    if (pedido.pagadas) return 'bg-blue-200';
    if (pedido.bordada) return 'bg-purple-200';
    if (pedido.entregada) return 'bg-green-200';
    return '';
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
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async () => {
    try {
      const pedidoRef = doc(firestore, 'Ventas', editingId);
      const updateData = {
        ...editForm,
        fechaPedido: editForm.fechaPedido || '',
        faltantes: !!editForm.faltantes,
        compradas: !!editForm.compradas,
        pagadas: !!editForm.pagadas
      };
      await updateDoc(pedidoRef, updateData);
      setPedidos(pedidos.map(pedido => 
        pedido.id === editingId ? updateData : pedido
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

  // Filtrar pedidos según término de búsqueda
  const filteredPedidos = pedidos.filter(pedido => {
    const searchStr = searchTerm.toLowerCase();
    return (
      pedido.persona?.toLowerCase().includes(searchStr) ||
      pedido.empresa?.toLowerCase().includes(searchStr) ||
      pedido.encargadoPor?.toLowerCase().includes(searchStr)
    );
  });

  if (loading) {
    return <div className="p-6 text-center">Cargando datos...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Lista de Pedidos</h2>
      
      {/* Barra de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por persona, empresa o encargado..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de datos */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {[
                'Persona', 'Encargado', 'Pago', 'Fecha', 'Turno', 'Empresa',
                'Colores', 'Marca', 'Talla', 'Género', 'Estado', 'Acciones'
              ].map((header) => (
                <th 
                  key={header}
                  onClick={() => handleSort(header.toLowerCase())}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  {header}
                  {sortConfig.key === header.toLowerCase() && (
                    <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPedidos.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-gray-50">
                {editingId === pedido.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        name="persona"
                        value={editForm.persona}
                        onChange={handleEditChange}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        name="encargadoPor"
                        value={editForm.encargadoPor}
                        onChange={handleEditChange}
                        className="w-full p-1 border rounded"
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
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="date"
                        name="fechaPedido"
                        value={editForm.fechaPedido}
                        onChange={handleEditChange}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        name="turno"
                        value={editForm.turno}
                        onChange={handleEditChange}
                        className="w-full p-1 border rounded"
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
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        name="colores"
                        value={editForm.colores}
                        onChange={handleEditChange}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        name="marca"
                        value={editForm.marca}
                        onChange={handleEditChange}
                        className="w-full p-1 border rounded"
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
                        className="w-full p-1 border rounded"
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
                        className="w-full p-1 border rounded"
                      >
                        {generoList.map(genero => (
                          <option key={genero} value={genero}>{genero}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="faltantes"
                            checked={editForm.faltantes}
                            onChange={handleEditChange}
                          />
                          <span className="ml-2">Faltante</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="compradas"
                            checked={editForm.compradas}
                            onChange={handleEditChange}
                          />
                          <span className="ml-2">Comprada</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="pagadas"
                            checked={editForm.pagadas}
                            onChange={handleEditChange}
                          />
                          <span className="ml-2">Pagada</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="bordada"
                            checked={editForm.bordada}
                            onChange={handleEditChange}
                          />
                          <span className="ml-2">bordada</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="entregada"
                            checked={editForm.entregada}
                            onChange={handleEditChange}
                          />
                          <span className="ml-2">entregada</span>
                        </label>
                        
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={handleEditSubmit}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">{pedido.persona}</td>
                    <td className="px-6 py-4">{pedido.encargadoPor}</td>
                    <td className="px-6 py-4">${pedido.pago}</td>
                    <td className="px-6 py-4">{pedido.fechaPedido}</td>
                    <td className="px-6 py-4">{pedido.turno}</td>
                    <td className="px-6 py-4">{pedido.empresa}</td>
                    <td className="px-6 py-4">{pedido.colores}</td>
                    <td className="px-6 py-4">{pedido.marca}</td>
                    <td className="px-6 py-4">{pedido.talla}</td>
                    <td className="px-6 py-4">{pedido.genero}</td>
                    <td className={`px-6 py-4 ${getRowColor(pedido)}`}>
                      <div className="space-y-1">
                        {pedido.faltantes && <span className="text-red-500">• Faltante</span>}
                        {pedido.compradas && <span className="text-green-500">• Comprada</span>}
                        {pedido.pagadas && <span className="text-blue-500">• Pagada</span>}
                        {pedido.bordada && <span className="text-blue-500">• bordada</span>}
                        {pedido.entregada && <span className="text-blue-500">• entregada</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                      <button
                          onClick={() => startEditing(pedido)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(pedido.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTableView;