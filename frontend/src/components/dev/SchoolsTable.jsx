import { format } from 'date-fns';

const SchoolsTable = ({ schools, loading }) => {
  if (loading) {
    return <div className="text-center py-8">Loading schools...</div>;
  }

  if (schools.length === 0) {
    return <div className="text-center py-8 text-gray-500">No schools registered yet.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">School</th>
            <th className="text-left py-3 px-4 font-medium">Admin</th>
            <th className="text-left py-3 px-4 font-medium">Email</th>
            <th className="text-left py-3 px-4 font-medium">Registered</th>
          </tr>
        </thead>
        <tbody>
          {schools.map((school) => (
            <tr key={school._id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {school.logo ? (
                    <img src={school.logo} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-dashed" />
                  )}
                  <div>
                    <p className="font-medium">{school.name}</p>
                    {school.motto && <p className="text-xs text-gray-500">{school.motto}</p>}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">{school.admin?.name || '—'}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{school.admin?.email || '—'}</td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {format(new Date(school.createdAt), 'MMM d, yyyy')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SchoolsTable;