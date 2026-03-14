import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';

function CreateUserPage() {
  return (
    <PageContainer
      title="Create User"
      subtitle="Add a new employee profile, assign access, and configure account details."
      actions={<PrimaryButton>Create User</PrimaryButton>}
    >
      <ContentCard title="Basic Information" subtitle="Initial account setup fields will live here.">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
              First Name
            </label>
            <input style={inputStyle} placeholder="Enter first name" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
              Last Name
            </label>
            <input style={inputStyle} placeholder="Enter last name" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
              Username
            </label>
            <input style={inputStyle} placeholder="e.g. pdues" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
              Temporary Password
            </label>
            <input style={inputStyle} placeholder="Set temporary password" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
              Role
            </label>
            <select style={inputStyle}>
              <option>Admin</option>
              <option>Manager</option>
              <option>Supervisor</option>
              <option>Team Lead</option>
              <option>Operator</option>
              <option>Trainer</option>
              <option>Team Member</option>
              <option>FSQA</option>
              <option>People Services</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
              Home Department
            </label>
            <select style={inputStyle}>
              <option>Packaging</option>
              <option>Baking</option>
              <option>FSQA</option>
              <option>People Services</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
              Shift
            </label>
            <select style={inputStyle}>
              <option>Packaging 1st Shift</option>
              <option>Baking 1st Shift</option>
              <option>Baking 3rd Shift</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>
              Employee ID
            </label>
            <input style={inputStyle} placeholder="Enter employee ID" />
          </div>
        </div>
      </ContentCard>
    </PageContainer>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #dbe4ee',
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

export default CreateUserPage;