import { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Trash2, Download } from 'lucide-react';

function FileAssistant() {
  const [files, setFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('crediativos-projects');
    return saved ? JSON.parse(saved) : [];
  });

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = uploadedFiles.map((file, index) => ({
      id: Date.now() + index,
      file: file,
      projectId: '',
      projectName: '',
      status: 'pending'
    }));
    setFiles([...files, ...newFiles]);
  };

  const updateFile = (id, field, value) => {
    setFiles(files.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const processFiles = async () => {
    setIsProcessing(true);
    const results = [];

    for (const fileObj of files) {
      if (!fileObj.projectId && !fileObj.projectName) {
        results.push({
          arquivo: fileObj.file.name,
          status: 'erro',
          mensagem: 'Projeto não selecionado'
        });
        continue;
      }

      // Encontrar o projeto
      let project = null;
      if (fileObj.projectId) {
        project = projects.find(p => p.id.toString() === fileObj.projectId);
      } else if (fileObj.projectName) {
        project = projects.find(p => p.name.toLowerCase() === fileObj.projectName.toLowerCase());
      }

      if (!project) {
        results.push({
          arquivo: fileObj.file.name,
          status: 'erro',
          mensagem: 'Projeto não encontrado'
        });
        continue;
      }

      // Simular vinculação do arquivo (em um cenário real, seria feito via API)
      const fileData = {
        id: Date.now(),
        nome: fileObj.file.name,
        tipo: fileObj.file.type,
        tamanho: fileObj.file.size,
        dataUpload: new Date().toLocaleDateString('pt-BR'),
        url: URL.createObjectURL(fileObj.file) // Simulação - em produção seria uma URL real
      };

      // Adicionar arquivo ao projeto
      const updatedProjects = projects.map(p => {
        if (p.id === project.id) {
          return {
            ...p,
            formularios: [...(p.formularios || []), fileData]
          };
        }
        return p;
      });

      setProjects(updatedProjects);
      localStorage.setItem('crediativos-projects', JSON.stringify(updatedProjects));

      results.push({
        arquivo: fileObj.file.name,
        projeto_id: project.id,
        projeto_nome: project.name,
        status: 'sucesso',
        local: 'aba_formularios'
      });
    }

    setProcessedFiles(results);
    setFiles([]);
    setIsProcessing(false);
  };

  const downloadReport = () => {
    const report = {
      lote_processado: processedFiles.length,
      data_processamento: new Date().toLocaleString('pt-BR'),
      formularios_vinculados: processedFiles.filter(f => f.status === 'sucesso'),
      erros: processedFiles.filter(f => f.status === 'erro')
    };

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_vinculacao_${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Assistente de Vinculação de Arquivos</h1>
          <p className="text-gray-600">Processe lotes de arquivos e vincule-os automaticamente aos projetos</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Carregar Arquivos</h2>
          
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:bg-blue-50 transition-colors">
            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-2">Arraste arquivos aqui ou clique para selecionar</p>
            <p className="text-gray-500 text-sm mb-4">Formatos suportados: PDF, DOCX, XLSX, PNG, JPG</p>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-input"
              accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
            />
            <label htmlFor="file-input" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer inline-block transition-colors">
              Selecionar Arquivos
            </label>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Arquivos Carregados ({files.length})</h2>
            
            <div className="space-y-4">
              {files.map(fileObj => (
                <div key={fileObj.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{fileObj.file.name}</p>
                      <p className="text-sm text-gray-500">{(fileObj.file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Projeto</label>
                      <select
                        value={fileObj.projectId}
                        onChange={(e) => updateFile(fileObj.id, 'projectId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione um projeto...</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ou Digite o Nome do Projeto</label>
                      <input
                        type="text"
                        value={fileObj.projectName}
                        onChange={(e) => updateFile(fileObj.id, 'projectName', e.target.value)}
                        placeholder="Nome do projeto"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={processFiles}
                disabled={isProcessing || files.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {isProcessing ? 'Processando...' : 'Processar Arquivos'}
              </button>
              <button
                onClick={() => setFiles([])}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {processedFiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Resultado do Processamento</h2>
              <button
                onClick={downloadReport}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Relatório</span>
              </button>
            </div>

            <div className="space-y-3">
              {processedFiles.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 flex items-start space-x-3 ${
                  result.status === 'sucesso' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  {result.status === 'sucesso' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  
                  <div className="flex-1">
                    <p className={`font-semibold ${result.status === 'sucesso' ? 'text-green-800' : 'text-red-800'}`}>
                      {result.arquivo}
                    </p>
                    {result.status === 'sucesso' ? (
                      <p className="text-sm text-green-700">
                        Vinculado ao projeto <strong>{result.projeto_nome}</strong> na aba Formulários
                      </p>
                    ) : (
                      <p className="text-sm text-red-700">{result.mensagem}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Resumo:</strong> {processedFiles.filter(f => f.status === 'sucesso').length} arquivo(s) vinculado(s) com sucesso, 
                {processedFiles.filter(f => f.status === 'erro').length > 0 && ` ${processedFiles.filter(f => f.status === 'erro').length} erro(s)`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileAssistant;

