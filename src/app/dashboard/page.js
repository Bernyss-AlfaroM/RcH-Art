"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Simulando la obtención de datos
        const fetchData = () => {
            return [
                { name: "Enero", ventas: 300 },
                { name: "Febrero", ventas: 300 },
                { name: "Marzo", ventas: 500 }
            ];
        };

        setData(fetchData());
    }, []);

    if (data.length === 0) {
        return <div>"Cargando...</div>; // O un loading spinner
    }

    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ventas" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}