import { supabase } from './lib/supabase';

function App() {
  console.log('Supabase client ready:', supabase);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h1>KB Academy</h1>
      <p>App initialized and Supabase client configured.</p>
    </div>
  );
}

export default App;