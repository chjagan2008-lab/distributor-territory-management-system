import DistributorForm from '../components/EntryForm/DistributorForm';

function FormPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Add Distributor</h2>
        <p className="text-gray-500 mt-1">
          Enter new distributor territory and performance data
        </p>
      </div>
      <DistributorForm />
    </div>
  );
}

export default FormPage;