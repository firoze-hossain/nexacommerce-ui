// components/dashboard/stats-cards.tsx
const stats = [
  { name: 'Total Products', value: '0', change: '+0%', changeType: 'positive' },
  { name: 'Total Orders', value: '0', change: '+0%', changeType: 'positive' },
  { name: 'Revenue', value: '$0.00', change: '+0%', changeType: 'positive' },
  { name: 'Customers', value: '0', change: '+0%', changeType: 'positive' },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => (
        <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{item.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className={`font-medium ${
                item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.change}
              </span>{' '}
              <span className="text-gray-500">from last month</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}