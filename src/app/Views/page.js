'use client';

import { useEffect, useState } from 'react';
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

  const getRowStatusClass = (pedido) => {
    if (pedido.faltantes) return styles.statusRed;
    if (pedido.compradas) return styles.statusYellow;
    if (pedido.pagadas) return styles.statusBlue;
    if (pedido.bordada) return styles.statusPurple;
    if (pedido.entregada) return styles.statusGreen;
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
        pagadas: !!editForm.pagadas,
        bordada: !!editForm.bordada,
        entregada: !!editForm.entregada
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
    return <div className={styles.loadingContainer}>Cargando datos...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Lista de Pedidos</h2>
      
      {/* Barra de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por persona, empresa o encargado..."
          className={styles.dataTableSearch}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla de datos */}
      <div className={styles.dataTableContainer}>
        <table className={styles.dataTable}>
          <thead className={styles.dataTableHeader}>
            <tr>
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
            {filteredPedidos.map((pedido) => (
              <tr key={pedido.id} className={styles.dataTableRow}>

                {editingId === pedido.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        name="persona"
                        value={editForm.persona}
                        onChange={handleEditChange}
                        className={styles.formInput}
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
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="faltantes"
                            checked={editForm.faltantes}
                            onChange={handleEditChange}
                            className={styles.formCheckbox}
                          />
                          <span className="ml-2">Faltante</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="compradas"
                            checked={editForm.compradas}
                            onChange={handleEditChange}
                            className={styles.formCheckbox}
                          />
                          <span className="ml-2">Comprada</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="pagadas"
                            checked={editForm.pagadas}
                            onChange={handleEditChange}
                            className={styles.formCheckbox}
                          />
                          <span className="ml-2">Pagada</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="bordada"
                            checked={editForm.bordada}
                            onChange={handleEditChange}
                            className={styles.formCheckbox}
                          />
                          <span className="ml-2">Bordada</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="entregada"
                            checked={editForm.entregada}
                            onChange={handleEditChange}
                            className={styles.formCheckbox}
                          />
                          <span className="ml-2">Entregada</span>
                        </label>
                      </div>
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
                    <td className="px-6 py-4">{pedido.persona}</td>
                    <td className="px-6 py-4">{pedido.encargadoPor}</td>
                    <td className="px-6 py-4">₡{pedido.pago}</td>
                    <td className="px-6 py-4">{pedido.fechaPedido}</td>
                    <td className="px-6 py-4">{pedido.turno}</td>
                    <td className="px-6 py-4">{pedido.empresa}</td>
                    <td className="px-6 py-4">{pedido.colores}</td>
                    <td className="px-6 py-4">{pedido.marca}</td>
                    <td className="px-6 py-4">{pedido.talla}</td>
                    <td className="px-6 py-4">{pedido.genero}</td>
                    <td className={`px-6 py-4 ${getRowStatusClass(pedido)}`}>
                      <div className="space-y-1">
                        {pedido.faltantes && <span className={styles.textRed}> • Faltante</span>}
                        {pedido.compradas && <span className={styles.textGreen}> • Comprada</span>}
                        {pedido.pagadas && <span className={styles.textBlue}> • Pagada</span>}
                        {pedido.bordada && <span className={styles.textBlue}> • Bordada</span>}
                        {pedido.entregada && <span className={styles.textGreen}> • Entregada</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTableView;