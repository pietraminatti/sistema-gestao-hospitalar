-- Tabela: especialidade
CREATE TABLE especialidade (
    codigo VARCHAR(255) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

-- Tabela: medico
CREATE TABLE medico (
    id UUID PRIMARY KEY,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    especialidade VARCHAR(255) NOT NULL,
    crm VARCHAR(20) NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela: consulta
CREATE TABLE consulta (
    codigo VARCHAR(255) PRIMARY KEY,
    data TIMESTAMP NOT NULL,
    especialidade VARCHAR(255) NOT NULL,
    medico VARCHAR(255) NOT NULL,
    valor DOUBLE PRECISION NOT NULL,
    vagas_total INTEGER NOT NULL,
    vagas_disponiveis INTEGER NOT NULL,
    status VARCHAR(255) NOT NULL
);

-- Tabela: agendamento
CREATE TABLE agendamento (
    id VARCHAR(255) PRIMARY KEY,
    codigo_consulta VARCHAR(255) NOT NULL,
    codigo_paciente VARCHAR(255) NOT NULL,
    data TIMESTAMP NOT NULL,
    especialidade VARCHAR(255) NOT NULL,
    medico VARCHAR(255) NOT NULL,
    valor DOUBLE PRECISION NOT NULL,
    pontos_usados INTEGER NOT NULL,
    valor_pago DOUBLE PRECISION NOT NULL,
    status VARCHAR(255) NOT NULL
);
