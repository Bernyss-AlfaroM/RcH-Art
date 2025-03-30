"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

export default function Dashboard() {
  // State management
  const [ventas, setVentas] = useState([]);
  const [totalVentas, setTotalVentas] = useState("");
  const [tallaMasVendida, setTallaMasVendida] = useState("");
  const [marcaMasVendida, setMarcaMasVendida] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date filter states
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Memoized data processing function
  const processVentasData = useCallback(async () => {
    try {
      setIsLoading(true);
      const ventasSnapshot = await getDocs(collection(firestore, "Ventas"));
      const ventasData = ventasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Date filtering
      const filteredVentas = ventasData.filter(venta => {
        if (!fechaInicio || !fechaFin) return true;
        const saleDate = new Date(venta.fecha);
        const startDate = new Date(fechaInicio);
        const endDate = new Date(fechaFin);
        return saleDate >= startDate && saleDate <= endDate;
      });

// Filtrar solo las ventas con estado "Pagada"
const ventasPagadas = filteredVentas.filter(venta => venta.estado === "Pagada");

// Obtener los valores de pago de las ventas filtradas
const salesValues = ventasPagadas.map(venta => venta.pago || 0);

// Sumar los valores de pago
const totalSumado = salesValues.reduce((sum, value) => sum + Number(value), 0);

// Formatear los valores para mostrar en la interfaz
const salesValueStrings = salesValues.map(value => 
  `₡${Number(value).toLocaleString()}`
);

const formattedTotal = `Total: ₡${totalSumado.toLocaleString()}`;
setTotalVentas(formattedTotal);


      // Most sold size calculation
      const tallasCount = filteredVentas.reduce((acc, venta) => {
        acc[venta.talla] = (acc[venta.talla] || 0) + 1;
        return acc;
      }, {});

      const tallaMasVendidaCalculated = Object.entries(tallasCount).reduce(
        (a, b) => (a[1] > b[1] ? a : b), 
        ['', 0]
      )[0];

      // Most sold brand calculation
      const marcasCount = filteredVentas.reduce((acc, venta) => {
        acc[venta.marca] = (acc[venta.marca] || 0) + 1;
        return acc;
      }, {});

      const marcaMasVendidaCalculated = Object.entries(marcasCount).reduce(
        (a, b) => (a[1] > b[1] ? a : b), 
        ['', 0]
      )[0];

      setVentas(filteredVentas);
      setTallaMasVendida(tallaMasVendidaCalculated);
      setMarcaMasVendida(marcaMasVendidaCalculated);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching sales:", error);
      setError("Could not load data");
      setIsLoading(false);
    }
  }, [fechaInicio, fechaFin]);

  // Fetch data on component mount and when date filters change
  useEffect(() => {
    processVentasData();
  }, [processVentasData]);

  // Memoize chart data calculations
  const tallasDataArray = useMemo(() => {
    const tallasData = ventas.reduce((acc, { talla }) => {
      acc[talla] = (acc[talla] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(tallasData).map(
      ([talla, count]) => ({ name: talla, value: count })
    );
  }, [ventas]);

  const encargadosData = useMemo(() => {
    const ventasPorEncargado = ventas.reduce((acc, { encargadoPor }) => {
      acc[encargadoPor] = (acc[encargadoPor] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(ventasPorEncargado).map(
      ([encargadoPor, count]) => ({
        name: encargadoPor,
        ventas: count
      })
    );
  }, [ventas]);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );

  // Error display component
  const ErrorDisplay = () => (
    <div className="text-red-500 text-center p-4">
      {error}
    </div>
  );

  // Render loading or error states
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay />;

  return (
    <div className="container mx-auto p-4">
      {/* Date filter section */}
      <div className="mb-4 flex space-x-4">
        {['Inicio', 'Fin'].map((type) => (
          <div key={type}>
            <label className="block text-sm font-medium text-gray-700">
              Fecha {type}
            </label>
            <input 
              type="date" 
              value={type === 'Inicio' ? fechaInicio : fechaFin}
              onChange={(e) => 
                type === 'Inicio' 
                  ? setFechaInicio(e.target.value) 
                  : setFechaFin(e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sales value display */}
        <div className="bg-white shadow-lg p-4 rounded-lg">
          <h2 className="text-xl font-bold">Valores de Ventas</h2>
          <p className="text-blue-600 overflow-auto max-h-32">
            {totalVentas}
          </p>
        </div>

        {/* Most sold size and brand */}
        {[
          { label: 'Talla más vendida', value: tallaMasVendida, color: 'blue' },
          { label: 'Marca más vendida', value: marcaMasVendida, color: 'red' }
        ].map(({ label, value, color }) => (
          <div 
            key={label} 
            className={`bg-white shadow-lg p-4 rounded-lg text-center`}
          >
            <h2 className="text-xl font-bold">{label}</h2>
            <p className={`text-2xl text-${color}-600`}>{value || "N/A"}</p>
          </div>
        ))}

        {/* Pie chart for sizes */}
        <div className="bg-white shadow-lg p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Tallas Más Vendidas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={tallasDataArray} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100} 
                fill="#82ca9d" 
                label
              >
                {tallasDataArray.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff0000"][index % 5]} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart for sales by person */}
        <div className="bg-white shadow-lg p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Ventas por Encargado</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={encargadosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ventas" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}