// Importe as bibliotecas React e os componentes necessários
import React, { useState, useEffect } from "react";
import { Container, Grid, Box, IconButton, Alert } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router";
// Importe os componentes para informações pessoais e profissionais do médico
import { PersonalInfoSection } from "../../components/profile/PersonalInfoSection";
import { EditProfileModal } from "../../components/profile/EditProfileModal";
// Importe types e services
import { useSelector, useDispatch } from "react-redux";

import { setAuth } from "../../stores/slices/user.slice";
import { ROUTING } from "../../constants/routing";

// Dados de exemplo - normalmente seriam obtidos de uma API
const mockDoctorData: any = {
  id: 1,
  userId: "dr123",
  firstName: "John",
  lastName: "Smith",
  sex: true,
  dob: "1980-05-15",
  address: {
    id: 1,
    number: "123",
    street: "Medical Street",
    ward: "Healthcare",
    district: "Central",
    city: "Metropolis",
    country: "USA",
  },
  phone: "+1234567890",
  avatar: "https://randomuser.me/api/portraits/men/41.jpg",
  email: "john.smith@healthcare.com",
  emailVerify: true,
  status: true,
  specialization: "Cardiologist",
  experience: {
    id: 1,
    compName: "Metro Hospital",
    specialization: "Cardiology",
    startDate: "2015-01-01",
    endDate: "",
    compAddress: {
      city: "Metropolis",
      country: "USA",
      id: 2,
      number: "123",
      street: "Hospital Street",
      ward: "Healthcare",
      district: "Central",
    },
    description:
      "Especializado em tratamentos cardiovasculares e cirurgias cardíacas.",
  },
};

// Componente da página de perfil do médico
const DoctorProfilePage: React.FC = () => {
  // Declaração dos estados necessários
  const [doctorData, setDoctorData] = useState<any | null>(null); // Armazena informações do médico
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Estado do modal de edição
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false); // Estado do modal de upload de avatar
  const [avatarLoading, setAvatarLoading] = useState(false); // Estado de carregamento do avatar
  const [avatarError, setAvatarError] = useState<string | null>(null); // Erro ao atualizar avatar
  const [error, setError] = useState<string | null>(null); // Mensagem de erro
  const user = useSelector((state: any) => state.user.user); // Obtém informações do usuário do Redux
  const dispatch = useDispatch(); // Hook para enviar ações ao Redux
  const navigate = useNavigate(); // Hook de navegação

  useEffect(() => {
    // Função para buscar dados do médico da API
    const fetchDoctorData = async () => {
      setLoading(true);
      try {
        // Chama a API para obter informações do médico pelo userId
        const response = await getDoctorInfo(user.userId);
        if (response.data && response.data.code === 200) {
          console.log("Dados do médico:", response.data.data.doctor.sex);
          setDoctorData(response.data.data);
        } else {
          setError("Falha ao obter dados do médico");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do médico:", error);
        setError(
          "Erro ao carregar dados do médico. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [user?.userId]);
  console.log("Dados do médico:", doctorData);

  // Função para abrir o modal de edição de informações pessoais
  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  // Função para fechar o modal de edição de informações pessoais
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  // Função para salvar informações pessoais
  const handleSaveProfile = (updatedData: any) => {
    // Atualiza o estado local para exibir imediatamente
    setDoctorData({ ...doctorData, ...updatedData });
    // Observação: Não é necessário chamar a API aqui, pois já é feito no EditProfileModal
  };

  // Exibe estado de carregamento
  if (loading) {
    return <div>Carregando...</div>;
  }

  // Exibe mensagem de erro, se houver
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Exibe mensagem quando não há dados
  if (!doctorData) {
    return <Alert severity="info">Nenhum dado disponível</Alert>;
  }

  // Renderiza a interface principal quando os dados estão disponíveis
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Seção de informações pessoais */}
        <Grid item xs={12}>
          <Box sx={{ position: "relative" }}>
            <PersonalInfoSection
              firstName={doctorData.doctor?.firstName || "Sem informação"}
              lastName={doctorData.doctor?.lastName || "Sem informação"}
              email={doctorData.doctor?.email || "Sem informação"}
              phone={doctorData.doctor?.phone || "Sem informação"}
              dob={doctorData.doctor?.dob || "Sem informação"}
              sex={doctorData.doctor?.sex ?? "Sem informação"}
              address={doctorData.doctor?.address || null}
              avatar={doctorData.doctor?.avatar || "/default-avatar.png"}
              hideEditButton={false} // Exibe botão de editar
            />
            {/* Botão para editar informações */}
            <IconButton
              color="primary"
              onClick={handleOpenEditModal}
              sx={{
                position: "absolute",
                top: "12px",
                right: "12px",
                bgcolor: "background.paper",
                "&:hover": {
                  bgcolor: "action.hover",
                },
                boxShadow: 1,
                zIndex: 1,
              }}
              aria-label="Editar"
              size="small"
            >
              <EditIcon />
            </IconButton>
            {/* Botão para trocar senha */}
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              size="small"
              sx={{
                position: "absolute",
                top: "12px",
                right: "52px",
                zIndex: 1,
                bgcolor: "background.paper",
                boxShadow: 1,
                minWidth: 0,
                px: 1.5,
              }}
              onClick={() => navigate(ROUTING.CHANGE_PASSWORD)}
            >
              Trocar senha
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Modal de edição de informações pessoais */}
      <EditProfileModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveProfile}
        userData={{
          firstName: doctorData.doctor?.firstName || "",
          lastName: doctorData.doctor?.lastName || "",
          email: doctorData.doctor?.email || "",
          phone: doctorData.doctor?.phone || "",
          dob: doctorData.doctor?.dob || "",
          sex: doctorData.doctor?.sex,
          address: doctorData.doctor?.address || null,
        }}
      />
    </Container>
  );
};

export default DoctorProfilePage;
