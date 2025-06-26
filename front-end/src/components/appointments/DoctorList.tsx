import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Paper,
  Pagination,
  Stack,
} from "@mui/material";
// import { getDoctorsBySpecialty } from "../../services/doctor_service";
import MedicationIcon from "@mui/icons-material/Medication";

/**
 * Propriedades para o componente DoctorList
 * @param specialty - Serviço/especialidade selecionado
 * @param onSelect - Função callback quando o usuário seleciona um médico
 * @param onBack - Função callback quando o usuário volta para o passo anterior
 */
interface DoctorListProps {
  specialty: any; // Agora representa um serviço
  onSelect: (doctor: any) => void;
  // onBack: () => void;
}

// Dados de exemplo para a lista de médicos por especialidade
const mockDoctorsBySpecialty = {
  "1": [
    // Cardiologia
    {
      id: "101",
      userId: "d101",
      firstName: "John",
      lastName: "Smith",
      specialization: "Cardiologia",
      experience: 12,
      rating: 4.8,
      reviews: 124,
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1470&auto=format&fit=crop",
    },
    {
      id: "102",
      userId: "d102",
      firstName: "Sarah",
      lastName: "Johnson",
      specialization: "Cardiologia",
      experience: 9,
      rating: 4.6,
      reviews: 98,
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1470&auto=format&fit=crop",
    },
  ],
  "2": [
    // Dermatologia
    {
      id: "201",
      userId: "d201",
      firstName: "Michael",
      lastName: "Brown",
      specialization: "Dermatologia",
      experience: 15,
      rating: 4.9,
      reviews: 152,
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1528&auto=format&fit=crop",
    },
  ],
  "3": [
    // Neurologia
    {
      id: "301",
      userId: "d301",
      firstName: "Jessica",
      lastName: "Williams",
      specialization: "Neurologia",
      experience: 11,
      rating: 4.7,
      reviews: 134,
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1470&auto=format&fit=crop",
    },
    {
      id: "302",
      userId: "d302",
      firstName: "David",
      lastName: "Miller",
      specialization: "Neurologia",
      experience: 8,
      rating: 4.5,
      reviews: 89,
      image:
        "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1470&auto=format&fit=crop",
    },
  ],
  "4": [
    // Ortopedia
    {
      id: "401",
      userId: "d401",
      firstName: "Robert",
      lastName: "Davis",
      specialization: "Ortopedia",
      experience: 14,
      rating: 4.8,
      reviews: 142,
      image:
        "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?q=80&w=1374&auto=format&fit=crop",
    },
  ],
  "5": [
    // Pediatria
    {
      id: "501",
      userId: "d501",
      firstName: "Jennifer",
      lastName: "Taylor",
      specialization: "Pediatria",
      experience: 10,
      rating: 4.9,
      reviews: 168,
      image:
        "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=1374&auto=format&fit=crop",
    },
    {
      id: "502",
      userId: "d502",
      firstName: "William",
      lastName: "Anderson",
      specialization: "Pediatria",
      experience: 7,
      rating: 4.6,
      reviews: 92,
      image:
        "https://images.unsplash.com/photo-1612531386530-97286d97c2d2?q=80&w=1470&auto=format&fit=crop",
    },
  ],
  "6": [
    // Psiquiatria
    {
      id: "601",
      userId: "d601",
      firstName: "Karen",
      lastName: "Martinez",
      specialization: "Psiquiatria",
      experience: 13,
      rating: 4.7,
      reviews: 115,
      image:
        "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=1470&auto=format&fit=crop",
    },
  ],
};

/**
 * Componente que exibe a lista de médicos de acordo com a especialidade selecionada
 * Permite ao usuário escolher um médico para agendar uma consulta
 * Suporta paginação para listas longas
 */
const DoctorList: React.FC<DoctorListProps> = ({
  specialty, // Agora representa um serviço
  onSelect,
  // onBack,
}) => {
  // Estado para controlar o carregamento dos dados
  const [loading, setLoading] = useState(true);
  // Estado para armazenar a lista de médicos
  const [doctors, setDoctors] = useState<any[]>([]);
  // Estado para armazenar mensagens de erro
  const [error, setError] = useState<string | null>(null);

  // Estado para paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);

  /**
   * Chama a API para buscar a lista de médicos pelo serviço quando o componente monta
   * ou quando o serviço selecionado muda
   */
  useEffect(() => {
    const fetchDoctorsByService = async () => {
      try {
        setLoading(true);
        setError(null);

        // Chama a API para buscar médicos pelo nome do tipo de doença/serviço
        const result = await getAllDoctorByTypeDiseaseName(specialty.name)
          .then((response) => response.data.data)
          .catch((error) => {
            console.log(error);
            return null;
          });

        // Atualiza o estado com os dados recebidos da API
        setDoctors(result);
      } catch (err) {
        console.error("Falha ao buscar médicos pelo serviço:", err);
        setError("Falha ao carregar médicos disponíveis. Tente novamente.");
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorsByService();
    // Volta para a primeira página quando o serviço muda
    setPage(0);
  }, [specialty]);

  /**
   * Manipula a troca de página
   * @param event - Evento de clique
   * @param newPage - Novo número da página
   */
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  /**
   * Manipula a alteração da quantidade de médicos por página
   * @param event - Evento de alteração
   */
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calcula os índices de início e fim para a paginação
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedDoctors = doctors.slice(startIndex, endIndex);

  return (
    <Box>
      {/* Título da página */}
      <Typography variant="h6" gutterBottom>
        {"Médicos disponíveis"}
      </Typography>

      {/* Nome do serviço/especialidade selecionado */}
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        {specialty.name}
      </Typography>

      {/* Exibe estado de carregamento, erro ou lista de médicos */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: "center", my: 4 }}>
          {error}
        </Typography>
      ) : (
        <>
          {doctors.length === 0 ? (
            <Paper
              elevation={1}
              sx={{
                my: 4,
                p: 3,
                textAlign: "center",
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              }}
            >
              <MedicationIcon
                sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                {"Nenhum médico disponível"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {"Tente outro serviço ou especialidade."}
              </Typography>
              {/* <Button variant="outlined" onClick={onBack} sx={{ mt: 2 }}>
								{"Selecionar outro serviço"}
							</Button> */}
            </Paper>
          ) : (
            <>
              {/* Lista de médicos */}
              <Grid container spacing={3}>
                {paginatedDoctors.map((doctor, index) => (
                  <Grid
                    item
                    xs={12}
                    md={6}
                    key={doctor.id || `doctor-${index}`}
                  >
                    <Card sx={{ height: "100%" }}>
                      <Box sx={{ display: "flex", p: 2 }}>
                        <Avatar
                          sx={{ width: 80, height: 80 }}
                          src={
                            doctor.avatar ||
                            "https://picsum.photos/120/120?random=1"
                          }
                          alt={
                            doctor.firstName + " " + doctor.lastName || "Médico"
                          }
                        />
                        <Box sx={{ ml: 2, flex: 1 }}>
                          <Typography component="div" variant="h6">
                            {doctor.firstName + " " + doctor.lastName ||
                              "Médico desconhecido"}
                          </Typography>
                          {doctor.specialization && (
                            <Chip
                              label={doctor.specialization}
                              size="small"
                              color="primary"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          p: 2,
                          pt: 0,
                        }}
                      >
                        <Button
                          size="small"
                          onClick={() => onSelect(doctor)}
                          variant="contained"
                        >
                          {"Selecionar"}
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Controle de paginação */}
              <Box
                sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}
              >
                <Stack spacing={2}>
                  <Pagination
                    count={Math.ceil(doctors.length / rowsPerPage)}
                    page={page + 1}
                    onChange={(e, value) => setPage(value - 1)}
                    color="primary"
                  />
                </Stack>
              </Box>
            </>
          )}
        </>
      )}

      {/* Botão de voltar */}
      {/* <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
				<Button onClick={onBack}>{"Voltar"}</Button>
			</Box> */}
    </Box>
  );
};

export default DoctorList;
