import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#00C49F', '#FF8042'];

const MyPieChart = ({ completionPercentage }) => {
  const data = [
    { name: 'Выполнено', value: completionPercentage },
    { name: 'Не выполнено', value: 100 - completionPercentage },
  ];

  return (
    <div style={{ marginBottom: '10px', height: '200px' }}>
      <PieChart width={300} height={200}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          label={({ value }) => `${value}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default MyPieChart;
