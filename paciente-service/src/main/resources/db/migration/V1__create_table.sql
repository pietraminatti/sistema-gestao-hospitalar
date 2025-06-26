CREATE TABLE paciente (
    id UUID PRIMARY KEY,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    nome VARCHAR(255),
    telefone VARCHAR(20),
    cep VARCHAR(10),
    logradouro VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(255),
    bairro VARCHAR(255),
    cidade VARCHAR(255),
    estado VARCHAR(2),
    pontos INTEGER DEFAULT 0
);

CREATE TABLE transacao_pontos (
    id SERIAL PRIMARY KEY,
    paciente_id UUID REFERENCES paciente(id) ON DELETE CASCADE,
    tipo VARCHAR(20),
    descricao VARCHAR(255),
    quantidade INTEGER,
    valor DOUBLE PRECISION,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

