'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firestore } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const AdminPanel = () => {
  // Listas predefinidas
  const encargadosList = ["Bernyss", "Brayan", "Stephanie"];
  const generoList = ["Hombre", "Mujer"];
  const marcaList = ["Okey", "Columbia", "Unicreses"];
  const turnoList = ["A", "B", "C"];
  const tallaList = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    persona: '',
    encargadoPor: encargadosList[0], // Valor por defecto
    pago: '',
    fechaPedido: '',
    turno: turnoList[0], // Valor por defecto
    empresa: '',
    colores: '',
    marca: marcaList[0], // Valor por defecto
    talla: tallaList[0], // Valor por defecto
    genero: generoList[0], // Valor por defecto
    faltantes: false,
    compradas: false,
    entregadas: false,
    pagadas: false,
    bordada: false,
    comentarios: ''
  });
  const [totalVentas, setTotalVentas] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    const fetchTotalVentas = async () => {
      try {
        const ventasSnapshot = await getDocs(collection(firestore, 'Ventas'));
        let total = 0;
        ventasSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.pago) {
            total += parseFloat(data.pago);
          }
        });
        setTotalVentas(total);
      } catch (err) {
        console.error('Error al obtener las ventas:', err);
      }
    };
    
    fetchTotalVentas();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Error durante el logout:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(firestore, 'Ventas'), {
        ...formData,
        fechaRegistro: new Date(),
      });

      setFormData({
        persona: '',
        encargadoPor: encargadosList[0],
        pago: '',
        fechaPedido: '',
        turno: turnoList[0],
        empresa: '',
        colores: '',
        marca: marcaList[0],
        talla: tallaList[0],
        genero: generoList[0],
        faltantes: false,
        compradas: false,
        entregadas: false,
        pagadas: false,
        bordada: false,
        comentarios: ''
      });

      alert('Pedido registrado correctamente');
      if (formData.pago) {
        setTotalVentas(prevTotal => prevTotal + parseFloat(formData.pago));
      }
    } catch (err) {
      console.error('Error al registrar el pedido:', err);
      alert('Error al registrar el pedido');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">RxH Art Admin</h2>
      {user ? (
        <>
          <p className="mb-4">Bienvenido, {user.email}</p>
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded mb-6"
          >
            Salir
          </button>
          
          <h3 className="text-xl font-semibold mb-4">Registrar Pedido</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Persona:</label>
                <input
                  type="text"
                  name="persona"
                  value={formData.persona}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">A quien se la encargo:</label>
                <select
                  name="encargadoPor"
                  value={formData.encargadoPor}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {encargadosList.map((encargado) => (
                    <option key={encargado} value={encargado}>
                      {encargado}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Pago:</label>
                <input
                  type="number"
                  name="pago"
                  value={formData.pago}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Fecha de pedido:</label>
                <input
                  type="date"
                  name="fechaPedido"
                  value={formData.fechaPedido}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Turno:</label>
                <select
                  name="turno"
                  value={formData.turno}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {turnoList.map((turno) => (
                    <option key={turno} value={turno}>
                      {turno}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Empresa:</label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Colores:</label>
                <input
                  type="text"
                  name="colores"
                  value={formData.colores}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Marca:</label>
                <select
                  name="marca"
                  value={formData.marca}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {marcaList.map((marca) => (
                    <option key={marca} value={marca}>
                      {marca}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Talla:</label>
                <select
                  name="talla"
                  value={formData.talla}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {tallaList.map((talla) => (
                    <option key={talla} value={talla}>
                      {talla}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Género:</label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  {generoList.map((genero) => (
                    <option key={genero} value={genero}>
                      {genero}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="faltantes"
                    checked={formData.faltantes}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>¿Estas faltan?</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="compradas"
                    checked={formData.compradas}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>¿Ya se compraron?</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="entregadas"
                    checked={formData.entregadas}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>¿Ya se entregaron?</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="pagadas"
                    checked={formData.pagadas}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>¿Ya se pagaron?</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="bordada"
                    checked={formData.bordada}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>¿Ya se bordro?</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-1">Comentarios:</label>
              <textarea
                name="comentarios"
                value={formData.comentarios}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>

            <button 
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Registrar Pedido
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="text-xl font-semibold">Total de Ventas: ${totalVentas}</h3>
          </div>
        </>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default AdminPanel;