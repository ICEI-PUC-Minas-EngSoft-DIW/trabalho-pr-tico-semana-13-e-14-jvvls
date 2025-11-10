const urlBase = 'http://localhost:3000/criptomoedas';

// === POST (criar nova) ===
async function novaPostagem(dados) {
  try {
    // Remove o id se o usuário digitou
    const { id, ...dadosSemId } = dados;

    // Adiciona imagem padrão se não houver
    const dadosComImagem = {
      ...dadosSemId,
      imagem_principal: dadosSemId.imagem_principal?.trim() || 'assets/img/default.png'
    };

    const response = await fetch(urlBase, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosComImagem)
    });

    if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);

    const data = await response.json();
    console.log("✅ Nova postagem criada:", data);
    alert(`Postagem criada com sucesso! ID gerado: ${data.id}`);
  } catch (error) {
    console.error("❌ Falha ao publicar dados:", error);
  }
}

// === PUT (editar existente) ===
async function editarPostagem(id, dados) {
  try {
    if (!id) {
      alert("❌ Informe o ID da postagem que deseja editar.");
      return;
    }

    const response = await fetch(`${urlBase}/${id}`, {
      method: 'PUT',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);

    const data = await response.json();
    console.log("✏️ Postagem atualizada:", data);
    alert("✅ Postagem atualizada com sucesso!");
  } catch (error) {
    console.error("❌ Falha ao editar dados:", error);
  }
}

// === DELETE (apagar existente) ===
async function apagarPostagem(id) {
  try {
    if (!id) {
      alert("❌ Informe o ID da postagem que deseja deletar.");
      return;
    }

    const response = await fetch(`${urlBase}/${id}`, { method: 'DELETE' });

    if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);

    console.log(`🗑️ Postagem ${id} apagada com sucesso.`);
    alert("✅ Postagem deletada com sucesso!");
  } catch (error) {
    console.error("❌ Falha ao deletar dados:", error);
  }
}

// === FUNÇÃO EDITOR PRINCIPAL ===
async function Editor(e) {
  e.preventDefault();

  const status = document.getElementById('status').value;
  const id = document.getElementById('id')?.value?.trim();
  const nome = document.getElementById('nome').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const criador = document.getElementById('criador').value.trim();
  const ano = parseInt(document.getElementById('ano').value);
  const conteudo = document.getElementById('conteudo').value.trim();

  const dados = { nome, descricao, criador, ano_criacao: ano, conteudo };

  switch (status) {
    case 'POST':
      await novaPostagem(dados);
      break;

    case 'PUT':
      await editarPostagem(id, dados);
      break;

    case 'DELETE':
      await apagarPostagem(id);
      break;

    default:
      alert("Selecione uma ação válida.");
  }

  document.getElementById('form-nova').reset();
}

// === CARREGAR DADOS ===
async function carregarDados() {
  try {
    const response = await fetch(urlBase, { method: 'GET' });
    if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("❌ Falha ao carregar dados da API:", error);
    return [];
  }
}

// === EVENTO FORMULÁRIO ===
const formNova = document.getElementById('form-nova');
if (formNova) {
  formNova.addEventListener('submit', Editor);
}

// === HOME ===
async function montarHome() {
  const carouselContainer = document.getElementById('carousel-container');
  const cardsContainer = document.getElementById('cards-container');
  if (!carouselContainer || !cardsContainer) return;

  const criptomoedas = await carregarDados();

  // --- Carrossel ---
  carouselContainer.innerHTML = '';
  criptomoedas
    .filter(item => item.destaque)
    .slice(0, 3)
    .forEach((item, index) => {
      const activeClass = index === 0 ? 'active' : '';
      carouselContainer.innerHTML += `
        <div class="carousel-item ${activeClass}">
          <div class="text-center">
            <a href="detalhes.html?id=${item.id}" class="text-decoration-none text-dark">
              <img src="${item.imagem_principal}" class="d-block w-100 rounded" alt="${item.nome}">
              <div class="carousel-caption bg-dark bg-opacity-50 rounded p-2">
                <h5 class="text-white">${item.nome}</h5>
                <p class="text-white-50 small">${item.descricao}</p>
              </div>
            </a>
          </div>
        </div>
      `;
    });

  // --- Cards ---
  cardsContainer.innerHTML = '';
  criptomoedas.forEach(item => {
    const col = document.createElement('div');
    col.className = "col-md-4 mb-4";
    col.innerHTML = `
      <div class="bloco h-100 p-3 text-center">
        <a href="detalhes.html?id=${item.id}" class="text-decoration-none text-dark">
          <img src="${item.imagem_principal}" alt="${item.nome}" class="w-100 rounded mb-3">
          <h4>${item.nome}</h4>
          <p class="text-muted small">${item.descricao}</p>
        </a>
      </div>
    `;
    cardsContainer.appendChild(col);
  });
}

// === DETALHES ===
async function montarDetalhes() {
  const detalhe = document.getElementById('detalhe');
  if (!detalhe) return;

  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const criptomoedas = await carregarDados();

    const item = criptomoedas.find(i => i.id == id);
    if (!item) {
      detalhe.innerHTML = "<p>Criptomoeda não encontrada.</p>";
      return;
    }

    const subtopsHTML = (item.subtopicos || []).map(sub => `
      <div class="col-md-4 mb-3">
        <div class="card h-100">
          <img src="${sub.imagem || 'default.png'}" class="card-img-top" alt="${sub.titulo}">
          <div class="card-body">
            <h5 class="card-title">${sub.titulo}</h5>
            <p class="card-text">${sub.descricao}</p>
          </div>
        </div>
      </div>
    `).join('');

    detalhe.innerHTML = `
      <h2>${item.nome}</h2>
      <img src="${item.imagem_principal || 'default.png'}" class="w-75 rounded my-3" alt="${item.nome}">
      <p><strong>Criador:</strong> ${item.criador}</p>
      <p><strong>Ano de criação:</strong> ${item.ano_criacao}</p>
      <p>${item.conteudo}</p>
      <hr>
      <h4 class="mt-4">Subtópicos</h4>
      <div class="row mt-3">${subtopsHTML}</div>
    `;
  } catch (error) {
    console.error("❌ Falha ao carregar detalhes:", error);
    detalhe.innerHTML = "<p>Erro ao carregar os detalhes da criptomoeda.</p>";
  }
}


// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
  montarHome();
  montarDetalhes();
});
