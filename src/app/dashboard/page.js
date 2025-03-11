"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
    const [ventas, setVentas] = useState([]);
    const [totalVentas, setTotalVentas] = useState(0);
    const [tallaMasVendida, setTallaMasVendida] = useState("");
    const [marcaMasVendida, setMarcaMasVendida] = useState("");

    useEffect(() => {
        const fetchVentas = async () => {
            const ventasSnapshot = await getDocs(collection(firestore, "Ventas"));
            const ventasData = ventasSnapshot.docs.map(doc => doc.data());

            setVentas(ventasData);

            // Calcular total de ventas
            const total = ventasData.reduce((sum, venta) => sum + (venta.pago || 0), 0);
            setTotalVentas(total);

            // Calcular la talla más vendida
            const tallasContador = ventasData.reduce((acc, venta) => {
                acc[venta.talla] = (acc[venta.talla] || 0) + 1;
                return acc;
            }, {});
            setTallaMasVendida(Object.keys(tallasContador).reduce((a, b) => (tallasContador[a] > tallasContador[b] ? a : b), ""));

            // Calcular la marca más vendida
            const marcasContador = ventasData.reduce((acc, venta) => {
                acc[venta.marca] = (acc[venta.marca] || 0) + 1;
                return acc;
            }, {});
            setMarcaMasVendida(Object.keys(marcasContador).reduce((a, b) => (marcasContador[a] > marcasContador[b] ? a : b), ""));
        };

        fetchVentas();
    }, []);

    if (ventas.length === 0) {
        return <div>Cargando datos...</div>;
    }

    // Datos para gráfico de pie (tallas más vendidas)
    const tallasData = Object.entries(
        ventas.reduce((acc, { talla }) => {
            acc[talla] = (acc[talla] || 0) + 1;
            return acc;
        }, {})
    ).map(([talla, count]) => ({ name: talla, value: count }));

    // Datos para gráfico de barras (ventas por encargado)
    const ventasPorEncargado = ventas.reduce((acc, { encargadoPor }) => {
        acc[encargadoPor] = (acc[encargadoPor] || 0) + 1;
        return acc;
    }, {});

    const encargadosData = Object.entries(ventasPorEncargado).map(([encargadoPor, count]) => ({
        name: encargadoPor,
        ventas: count
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Total de dinero recogido */}
            <div className="bg-white shadow-lg p-4 rounded-lg text-center">
                <h2 className="text-xl font-bold">Monto total ventas</h2>
                <p className="text-2xl text-green-600">₡{Number(totalVentas).toLocaleString()}</p>
            </div>

            {/* Talla más vendida */}
            <div className="bg-white shadow-lg p-4 rounded-lg text-center">
                <h2 className="text-xl font-bold">Talla más vendida</h2>
                <p className="text-2xl text-blue-600">{tallaMasVendida || "N/A"}</p>
            </div>

            {/* Marca más vendida */}
            <div className="bg-white shadow-lg p-4 rounded-lg text-center">
                <h2 className="text-xl font-bold">Marca más vendida</h2>
                <p className="text-2xl text-red-600">{marcaMasVendida || "N/A"}</p>
            </div>

            {/* Gráfico de Pie de Tallas Más Vendidas */}
            <div className="bg-white shadow-lg p-4 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Tallas Más Vendidas</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={tallasData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#82ca9d" label>
                            {tallasData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff0000"][index % 5]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Gráfico de Ventas por Encargado */}
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
    );
}
