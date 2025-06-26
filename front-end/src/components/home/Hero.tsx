import { Box, Container, Typography, Button, Grid2 } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router";
import { ROUTING } from "../../constants/routing";

const HeroBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.background.paper} 60%, ${theme.palette.primary.light} 40%)`,
  padding: theme.spacing(4, 0),
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "white",
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  textAlign: "center",
}));

export default function Hero() {
  const navigate = useNavigate();
  const handleBookAppointment = () => {
    navigate(ROUTING.LOGIN);
  };
  return (
    <HeroBox>
      <Container>
        <Grid2 container spacing={4} alignItems="center">
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Typography variant="h1" gutterBottom>
              Sua Saúde é Nossa Prioridade.
            </Typography>
            <Typography variant="body1" paragraph>
              Oferecemos os serviços médicos mais completos, para que todos
              tenham a oportunidade de receber cuidados de saúde de qualidade.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
              onClick={handleBookAppointment}
            >
              Agendar Consulta
            </Button>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Box
              component="img"
              src="/doctor3.png"
              sx={{
                width: "100%",
                maxWidth: 500,
                height: 530,
                objectFit: "contain",
              }}
            />
          </Grid2>
        </Grid2>
        <Grid2 container spacing={2} sx={{ mt: 4 }}>
          {[
            "Agendamento Online",
            "Equipe de Especialistas",
            "Atendimento de Alta Qualidade",
          ].map((feature) => (
            <Grid2 size={{ xs: 12, md: 4 }} key={feature}>
              <FeatureCard>
                <Typography variant="h6">{feature}</Typography>
              </FeatureCard>
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </HeroBox>
  );
}
