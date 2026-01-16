import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, PrimaryButton, SecondaryButton, TextInput } from '../ui/Controls';
import { useSessionStore } from '../state/store';
import { importSession } from '../storage/persistence';

const Home = () => {
  const navigate = useNavigate();
  const { sessions, init, createSession, loadSessionById, loading } = useSessionStore();
  const [name, setName] = useState('');
  const [importError, setImportError] = useState('');

  useEffect(() => {
    void init();
  }, [init]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createSession(name.trim());
    navigate('/new');
  };

  const handleContinue = async (id: string) => {
    await loadSessionById(id);
    navigate('/table');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportError('');
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const state = await importSession(payload);
      await loadSessionById(state.id);
      navigate('/table');
    } catch (error) {
      setImportError('Ошибка импорта: проверьте JSON.');
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Новая партия">
        <div className="flex flex-col gap-3 md:flex-row">
          <TextInput
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Название партии"
          />
          <PrimaryButton onClick={handleCreate}>Создать</PrimaryButton>
        </div>
      </Card>

      <Card title="Сессии">
        <div className="space-y-3">
          {loading && <div className="text-sm text-slate-400">Загрузка...</div>}
          {sessions.length === 0 && !loading && (
            <div className="text-sm text-slate-400">Сессий пока нет.</div>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="text-sm font-semibold">{session.name}</div>
                <div className="text-xs text-slate-400">
                  Обновлено: {new Date(session.updatedAt).toLocaleString()}
                </div>
              </div>
              <SecondaryButton onClick={() => handleContinue(session.id)}>Продолжить</SecondaryButton>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Импорт JSON">
        <input
          type="file"
          accept="application/json"
          onChange={handleImport}
          className="block w-full text-sm"
        />
        {importError && <div className="mt-2 text-sm text-rose-400">{importError}</div>}
      </Card>
    </div>
  );
};

export default Home;
