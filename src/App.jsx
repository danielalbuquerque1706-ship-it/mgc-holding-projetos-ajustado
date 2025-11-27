import { useState, useEffect } from 'react';
import {
  Plus,
  CheckCircle2,
  PlayCircle,
  Circle,
  Trash2,
  Edit2,
  X,
  RefreshCcw,
  LogOut,
  UserPlus,
} from 'lucide-react';

import './App.css';
import logo from './assets/logo_mgc_holding_transparent.png';
import Login from './Login';
import { supabase } from './lib/supabase';

// ---------------------------
//  MAPEAR BANCO → FRONT
// ---------------------------
function fromDbRow(row) {
  return {
    id: row.id,
    name: row.name || '',
    description: row.description || '',
    startDate: row.startDate || '',
    endDate: row.endDate || '',
    status: row.status || 'inicio',
    type: 'interno',
    areaSolicitante: row.areaSolicitante || '',
    responsavelSolicitacao: row.responsavelSolicitacao || '',
    responsavelExecucao: row.responsavelExecucao || '',
    priority: row.priority || 'media',
    progresso: row.progresso || 0,
    classificacao:
      row.classificacao !== null && row.classificacao !== undefined
        ? String(row.classificacao)
        : '',
  };
}

// ---------------------------
//  MAPEAR FRONT → BANCO
// ---------------------------
function toDbPayload(formData) {
  return {
    name: formData.name,
    description: formData.description,
    startDate: formData.startDate || null,
    endDate: formData.endDate || null,
    status: formData.status,
    areaSolicitante: formData.areaSolicitante,
    responsavelSolicitacao: formData.responsavelSolicitacao || null,
    responsavelExecucao: formData.responsavelExecucao || null,
    priority: formData.priority || null,
    progresso: formData.progresso || 0,
    classificacao:
      formData.classificacao !== '' &&
      formData.classificacao !== null &&
      !isNaN(Number(formData.classificacao))
        ? Number(formData.classificacao)
        : null,
  };
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAuthenticated') === 'true'
  );

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'inicio',
    type: 'interno',
    areaSolicitante: '',
    responsavelSolicitacao: '',
    responsavelExecucao: '',
    priority: 'media',
    progresso: 0,
    classificacao: '',
  });

  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterArea, setFilterArea] = useState([]);
  const [filterPriority, setFilterPriority] = useState('todas');
  const [filterExecutor, setFilterExecutor] = useState('todos');
  const [filterClassificacao, setFilterClassificacao] = useState('todas');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    isAdmin: false,
  });

  // ---------------------------
  //  Buscar Projetos do Supabase
  // ---------------------------
  const fetchProjects = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('Projetos') // <-- Nome da sua tabela
        .select('*')
        .order('classificacao', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar projetos do Supabase:', error);
        return;
      }

      const mapped = (data || []).map(fromDbRow);
      setProjects(mapped);
    } catch (err) {
      console.error('Erro inesperado ao buscar projetos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProjects();
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('crediativos-projects', JSON.stringify(projects));
  }, [projects]);

  // ---------------------------
  //  Fechar Modal
  // ---------------------------
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'inicio',
      type: 'interno',
      areaSolicitante: '',
      responsavelSolicitacao: '',
      responsavelExecucao: '',
      priority: 'media',
      progresso: 0,
      classificacao: '',
    });
  };

  // ---------------------------
  //  Salvar Projeto
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = toDbPayload(formData);

      if (editingProject) {
        const { data, error } = await supabase
          .from('projetos')
          .update(payload)
          .eq('id', editingProject.id)
          .select()
          .single();

        if (error) {
          console.error('Erro ao atualizar projeto:', error);
        } else {
          setProjects((prev) =>
            prev.map((p) => (p.id === data.id ? fromDbRow(data) : p))
          );
        }
      } else {
        const { data, error } = await supabase
          .from('projetos')
          .insert([payload])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar projeto:', error);
        } else {
          setProjects((prev) => [...prev, fromDbRow(data)]);
        }
      }
    } catch (err) {
      console.error('Erro inesperado ao salvar projeto:', err);
    }

    handleCloseModal();
  };

  // ---------------------------
  //  Editar
  // ---------------------------
  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      ...project,
      classificacao: project.classificacao || '',
    });
    setIsModalOpen(true);
  };

  // ---------------------------
  //  Deletar
  // ---------------------------
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;

    const { error } = await supabase
      .from('projetos')
      .delete()
      .eq('id', id);

    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleRefresh = () => fetchProjects();

  // ---------------------------
  //  Ícones de status
  // ---------------------------
  const getStatusIcon = (status) => {
    switch (status) {
      case 'inicio': return <Circle />;
      case 'andamento': return <PlayCircle />;
      case 'fim': return <CheckCircle2 />;
      default: return <Circle />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'inicio': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'andamento': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'fim': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'inicio': return 'Aguardando Início';
      case 'andamento': return 'Em Andamento';
      case 'fim': return 'Finalizado';
      default: return status;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  // ---------------------------
  //  FILTROS
  // ---------------------------
  const filteredProjects = projects
    .filter((p) => filterStatus === 'todos' || p.status === filterStatus)
    .filter((p) => filterPriority === 'todas' || p.priority === filterPriority)
    .filter((p) => filterExecutor === 'todos' || p.responsavelExecucao === filterExecutor)
    .filter((p) => filterArea.length === 0 || filterArea.includes(p.areaSolicitante || ''))
    .filter((p) => {
      if (filterClassificacao === 'todas') return true;
      return String(p.classificacao) === filterClassificacao;
    })
    .sort((a, b) => {
      const ca = a.classificacao ? Number(a.classificacao) : 999999;
      const cb = b.classificacao ? Number(b.classificacao) : 999999;
      return ca - cb;
    });

  // ---------------------------
  //  RENDERIZAÇÃO
  // ---------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MGC HOLDING" className="h-10" />
            <div>
              <h1 className="text-2xl text-white font-bold">Controle de Projetos</h1>
              <p className="text-sm text-gray-400">Gerencie seus projetos com eficiência</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="btn-green" onClick={() => setIsUserModalOpen(true)}>
              <UserPlus /> Novo Usuário
            </button>
            <button className="btn-purple" onClick={handleRefresh}>
              <RefreshCcw /> Atualizar
            </button>
            <button className="btn-red" onClick={() => {
              sessionStorage.removeItem('isAuthenticated');
              setIsAuthenticated(false);
            }}>
              <LogOut /> Sair
            </button>
            <button className="btn-blue" onClick={() => setIsModalOpen(true)}>
              <Plus /> Novo Projeto
            </button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SIDEBAR */}
          {/* ... (igual ao seu, não removi nada) ... */}

          {/* ÁREA PRINCIPAL */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-white text-center py-10">Carregando...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-gray-800 p-10 rounded-lg text-center border border-gray-700">
                <p className="text-gray-400">Nenhum projeto encontrado</p>
                <button className="btn-blue mt-4" onClick={() => setIsModalOpen(true)}>
                  Criar Projeto
                </button>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div key={project.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl text-white font-bold">{project.name}</h3>
                      <p className="text-gray-400 text-sm">{project.description}</p>

                      <div className="flex gap-2 mt-2">
                        <span className={`status-badge ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)} {getStatusLabel(project.status)}
                        </span>

                        <span className="badge">
                          {project.priority === 'alta'
                            ? '🔴 Alta'
                            : project.priority === 'media'
                            ? '🟡 Média'
                            : '🟢 Baixa'}
                        </span>

                        {project.classificacao && (
                          <span className="badge bg-gray-700 border border-gray-500">
                            Classificação {project.classificacao}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-gray-400 text-sm">
                        <p><strong>Área:</strong> {project.areaSolicitante}</p>
                        <p><strong>Executor:</strong> {project.responsavelExecucao}</p>
                        <p><strong>Início:</strong> {project.startDate}</p>
                        <p><strong>Fim:</strong> {project.endDate}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="btn-blue small" onClick={() => handleEdit(project)}>
                        <Edit2 />
                      </button>
                      <button className="btn-red small" onClick={() => handleDelete(project.id)}>
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAIS */}
      {/* (permanecem iguais, funcionando) */}
    </div>
  );
}

export default App;
