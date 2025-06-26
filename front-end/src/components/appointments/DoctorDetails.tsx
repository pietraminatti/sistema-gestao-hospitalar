import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  CardMedia,
  Chip,
  Rating,
  Paper,
  CircularProgress,
} from "@mui/material";
/**
 * Propriedades para o componente DoctorDetails
 * @param doctor - Informações do médico a serem exibidas em detalhes
 */
interface DoctorDetailsProps {
  doctor: any;
}

/**
 * Componente que exibe informações detalhadas sobre o médico
 * Inclui informações pessoais, formação, experiência e certificados
 */
const DoctorDetails: React.FC<DoctorDetailsProps> = ({ doctor }) => {
  // Estado para controlar o carregamento
  const [loading, setLoading] = useState(true);
  // Estado para armazenar detalhes do médico
  const [doctorDetails, setDoctorDetails] = useState<any>(null);
  // Estado para armazenar mensagens de erro, se houver
  const [error, setError] = useState<string | null>(null);

  /**
   * Chama a API para buscar detalhes do médico ao montar o componente
   */
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Buscando detalhes do médico para:", doctor);
        const response = await getDoctorInfo(doctor.userId);
        console.log("Resposta dos detalhes do médico:", response.data.data);
        setDoctorDetails(response.data.data || doctor);
      } catch (err) {
        console.error("Falha ao buscar detalhes do médico:", err);
        setError(
          "Falha ao carregar detalhes do médico. Usando informações básicas."
        );
        setDoctorDetails(doctor);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctor]);

  // Exibe spinner de carregamento enquanto os dados estão sendo carregados
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Extrai dados de doctorDetails
  const details = doctorDetails || doctor;
  const infoBasic = details.doctor || {};
  const education = details.educations || [];
  const experience = details.experiences || [];
  const certificates = details.certificates || [];

  return (
    <Box>
      {/* Exibe mensagem de erro, se houver */}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Informações básicas do médico */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          {/* Foto do médico */}
          <Grid item xs={12} sm={3}>
            <CardMedia
              component="img"
              sx={{
                width: "80%",
                maxWidth: "120px",
                borderRadius: 1,
                margin: "0 auto",
              }}
              image={
                infoBasic.avatar || "https://picsum.photos/120/160?random=1" // Imagem padrão se não houver avatar
              }
              alt={infoBasic.lastName || "Médico"}
            />
          </Grid>
          {/* Informações básicas sobre o médico */}
          <Grid item xs={12} sm={9}>
            <Typography variant="h5" component="div">
              {infoBasic.firstName + " " + infoBasic.lastName || "Médico"}
            </Typography>
            <Chip
              label={infoBasic.specialization}
              color="primary"
              sx={{ mt: 1, mb: 1 }}
            />
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Rating value={details.rating || 0} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({details.reviews || 0} avaliações)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DoctorDetails;
