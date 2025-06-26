import React, { useState, useEffect } from "react";
import { Container, Grid, Box, IconButton, Alert } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import { useLocation, useNavigate } from "react-router";
import CreditCardIcon from "@mui/icons-material/CreditCard";

// Importação dos componentes usados no perfil
import { PersonalInfoSection } from "../../components/profile/PersonalInfoSection";
import { EditProfileModal } from "../../components/profile/EditProfileModal";
import { useSelector } from "react-redux";
import { ROUTING } from "../../constants/routing";
import { RootState } from "../../stores/store";

const PatientProfilePage: React.FC = () => {
  const userData = useSelector((state: RootState) => state.user.profile);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);

  useEffect(() => {
    if (location.state?.openModal) {
      setIsEditModalOpen(true);
      setIsCompletingProfile(true);
    }
  }, [location.state]);

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  if (!userData) {
    return <div>Carregando...</div>;
  }

  if (!userData) {
    return <Alert severity="info">Sem dados disponíveis</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Seção de informações pessoais */}
        <Grid item xs={12}>
          <Box sx={{ position: "relative" }}>
            <PersonalInfoSection
              firstName={userData.nome?.split(" ")[0] || "Não informado"}
              lastName={userData.nome?.split(" ").slice(1).join(" ") || ""}
              email={userData.email || "Não informado"}
              phone={userData.telefone || "Não informado"}
              address={{
                logradouro: userData.logradouro || "Não informado",
                numero: userData.numero || "Não informado",
                complemento: userData.complemento,
                bairro: userData.bairro || "Não informado",
                cidade: userData.cidade || "Não informado",
                estado: userData.estado || "Não informado",
                cep: userData.cep || "Não informado",
              }}
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
          </Box>
        </Grid>

        {/* Seção de botões de ação */}
        <Grid item xs={12}>
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            {/* Botão para gerenciar conta bancária */}
            <Button
              variant="outlined"
              startIcon={<CreditCardIcon />}
              onClick={() => navigate(`../${ROUTING.BANK_ACCOUNT}`)}
            >
              Conta bancária
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Modal de edição de informações pessoais */}
      <EditProfileModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        isCompleting={isCompletingProfile}
        userData={{
          nome: userData.nome?.split(" ")[0] || "",
          sobrenome: userData.nome?.split(" ").slice(1).join(" ") || "",
          cpf: userData.cpf || "",
          email: userData.email || "",
          telefone: userData.telefone || "",
          cep: userData.cep || "",
          numero: userData.numero || "",
          complemento: userData.complemento || "",
          bairro: userData.bairro || "",
          cidade: userData.cidade || "",
          estado: userData.estado || "",
          logradouro: userData.logradouro || "",
        }}
      />
    </Container>
  );
};

export default PatientProfilePage;
