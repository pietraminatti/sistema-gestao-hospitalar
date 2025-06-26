import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tab,
  Tabs,
  Avatar,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { parseDateFromString } from "../../utils/dateUtils";
import { Doctor } from "../appointments/types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface DoctorDetailModalProps {
  open: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onUpdate: (updatedDoctor: Doctor) => void;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`doctor-tabpanel-${index}`}
      aria-labelledby={`doctor-tab-${index}`}
      {...other}
      style={{ padding: "16px 0" }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  open,
  onClose,
  doctor,
  onUpdate,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [isEducationFormOpen, setIsEducationFormOpen] = useState(false);
  const [isCertificateFormOpen, setIsCertificateFormOpen] = useState(false);
  const [isExperienceFormOpen, setIsExperienceFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTabValue(0);
      fetchDoctorDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchDoctorDetails = async () => {
    if (!doctor) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getDoctorInfo(doctor.userId).then(
        (res) => res.data
      );

      if (response && response.data) {
      } else {
        setError(
          "Não foi possível carregar as informações detalhadas do médico"
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError(
        "Ocorreu um erro ao carregar as informações detalhadas do médico"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getDiplomaLabel = (diploma: Diploma) => {
    switch (diploma) {
      case "BACHELOR":
        return "Bacharel";
      case "MASTER":
        return "Mestre";
      case "DOCTOR":
        return "Doutor";
      case "PROFESSOR":
        return "Professor";
      default:
        return "Não especificado";
    }
  };

  if (!doctor) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Detalhes do médico
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                mb: 3,
                ml: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                src={doctor.avatar || "/default-avatar.png"}
                alt={`${doctor.firstName} ${doctor.lastName}`}
                sx={{ width: 80, height: 80 }}
              />
              <Box>
                <Typography variant="h5">
                  {doctor.firstName} {doctor.lastName}
                </Typography>
                <Typography variant="subtitle1" color="primary">
                  {doctor.specialization}
                </Typography>
                <Typography variant="body2" component="div">
                  <Chip
                    label={doctor.status ? "Ativo" : "Inativo"}
                    color={doctor.status ? "success" : "error"}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Typography>
              </Box>
            </Box>

            <Box>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="doctor tabs"
              >
                <Tab label="Informações básicas" />
                <Tab label="Formação" />
                <Tab label="Certificados" />
                <Tab label="Experiência" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Paper sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        ID do médico
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {doctor.userId}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Telefone
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {doctor.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {doctor.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Especialidade
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {doctor.specialization}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Tipos de doenças atendidas
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {doctor.typeDisease ? (
                          <Chip
                            key={doctor.typeDisease.id}
                            label={doctor.typeDisease.name}
                            variant="outlined"
                            color="primary"
                            size="small"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhuma informação sobre tipos de doenças atendidas
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box
                  sx={{
                    mb: 2,
                    mr: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddEducation}
                  >
                    Adicionar formação
                  </Button>
                </Box>

                {educations && educations.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome da instituição</TableCell>
                          <TableCell>Grau</TableCell>
                          <TableCell>Período</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {educations.map((education) => (
                          <TableRow key={education.id}>
                            <TableCell>{education.schoolName}</TableCell>
                            <TableCell>
                              {getDiplomaLabel(education.diploma)}
                            </TableCell>
                            <TableCell>
                              {parseDateFromString(
                                education.joinedDate
                              ).getFullYear()}{" "}
                              -{" "}
                              {parseDateFromString(
                                education.graduateDate
                              ).getFullYear()}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditEducation(education)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Paper sx={{ p: 3, textAlign: "center" }}>
                    <Typography color="text.secondary">
                      Nenhuma informação de formação
                    </Typography>
                  </Paper>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Box
                  sx={{
                    mb: 2,
                    mr: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddCertificate}
                  >
                    Adicionar certificado
                  </Button>
                </Box>

                {certificates && certificates.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome do certificado</TableCell>
                          <TableCell>Data de emissão</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {certificates.map((certificate) => (
                          <TableRow key={certificate.id}>
                            <TableCell>{certificate.certName}</TableCell>
                            <TableCell>
                              {parseDateFromString(
                                certificate.issueDate
                              ).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  handleEditCertificate(certificate)
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Paper sx={{ p: 3, textAlign: "center" }}>
                    <Typography color="text.secondary">
                      Nenhuma informação de certificado
                    </Typography>
                  </Paper>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Box
                  sx={{
                    mb: 2,
                    mr: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddExperience}
                  >
                    Adicionar experiência
                  </Button>
                </Box>

                {experiences && experiences.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nome da empresa/hospital</TableCell>
                          <TableCell>Especialidade</TableCell>
                          <TableCell>Período</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {experiences.map((experience) => (
                          <TableRow key={experience.id}>
                            <TableCell>{experience.compName}</TableCell>
                            <TableCell>{experience.specialization}</TableCell>
                            <TableCell>
                              {parseDateFromString(
                                experience.startDate
                              ).toLocaleDateString("pt-BR")}
                              {experience.endDate
                                ? ` - ${parseDateFromString(
                                    experience.endDate
                                  ).toLocaleDateString("pt-BR")}`
                                : " - Atual"}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditExperience(experience)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Paper sx={{ p: 3, textAlign: "center" }}>
                    <Typography color="text.secondary">
                      Nenhuma informação de experiência
                    </Typography>
                  </Paper>
                )}
              </TabPanel>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>

      <EducationForm
        open={isEducationFormOpen}
        onClose={() => setIsEducationFormOpen(false)}
        onSuccess={handleEducationSuccess}
        education={selectedEducation}
        mode={formMode}
        doctorId={Number(doctor?.userId) || 0}
      />

      <CertificateForm
        open={isCertificateFormOpen}
        onClose={() => setIsCertificateFormOpen(false)}
        onSuccess={handleCertificateSuccess}
        certificate={selectedCertificate}
        mode={formMode}
        doctorId={Number(doctor?.userId) || 0}
      />

      <ExperienceForm
        open={isExperienceFormOpen}
        onClose={() => setIsExperienceFormOpen(false)}
        onSuccess={handleExperienceSuccess}
        experience={selectedExperience}
        mode={formMode}
        doctorId={Number(doctor?.userId) || 0}
      />
    </Dialog>
  );
};

export default DoctorDetailModal;
