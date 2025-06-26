import React, { useState, useEffect, useRef } from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Box,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Add, Visibility, UploadFile } from "@mui/icons-material";
import DoctorForm from "../../components/admin/DoctorForm";
import DoctorDetailModal from "../../components/admin/DoctorDetailModal";
import { format } from "date-fns";

const DoctorManagementPage: React.FC = () => {
  // Estados para gerenciar dados e UI
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [submitting, setSubmitting] = useState<boolean>(false);

  // Buscar lista de médicos da API
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getAllDoctors();
      if (response && response.data) {
        setDoctors(response.data);
      } else {
        setError("Não foi possível carregar a lista de médicos");
      }
    } catch (error) {
      console.error("Erro ao buscar médicos:", error);
      setError("Ocorreu um erro ao carregar a lista de médicos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);
  const handleAddClick = () => {
    setFormMode("add");
    setSelectedDoctor(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (doctor: Doctor) => {
    setFormMode("edit");
    setSelectedDoctor(doctor);
    setIsFormOpen(true);
    showMessage("Função de editar médico ainda não suportada", "info");
  };

  const handleViewDetail = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDetailOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
  };

  const handleFormSubmit = async (doctorData: Partial<Doctor>) => {
    try {
      setSubmitting(true);
      if (formMode === "add") {
        let formattedDob = "";
        if (doctorData.dob) {
          const dobDate = new Date(doctorData.dob);
          formattedDob = format(dobDate, "dd-MM-yyyy");
        }

        let diseaseInfo = null;
        if (doctorData.typeDisease) {
          diseaseInfo = doctorData.typeDisease.name;
        }

        const doctorToAdd = {
          ...doctorData,
          password: "123ww456789",
          dob: formattedDob,
          typeDisease: diseaseInfo,
          certificates: [],
          educations: [],
          experiences: [],
        };

        console.log("Enviando dados do médico:", JSON.stringify(doctorToAdd));

        const response = await addDoctor(doctorToAdd);
        console.log("Resposta do addDoctor:", response);
        if (response && response.data) {
          setDoctors([...doctors, response.data]);
          showMessage("Médico adicionado com sucesso", "success");
        }
      } else {
        showMessage("Função de atualizar médico ainda não suportada", "info");
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Erro ao enviar dados do médico:", error);
      showMessage(
        `Erro ao ${formMode === "add" ? "adicionar" : "atualizar"} médico`,
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = async (id: number) => {
    try {
      setLoading(true);
      const doctorToDelete = doctors.find((doctor) => doctor.id === id);

      if (!doctorToDelete) {
        showMessage("Médico não encontrado", "error");
        return;
      }

      const response = await deleteDoctor(doctorToDelete.userId);

      if (response.code === 200) {
        setDoctors(
          doctors.map((doctor) =>
            doctor.id === id ? { ...doctor, status: false } : doctor
          )
        );
        showMessage("Médico excluído com sucesso", "success");
      } else {
        showMessage("Falha ao excluir médico", "error");
      }
    } catch (error) {
      console.error("Erro ao excluir médico:", error);
      showMessage("Erro ao excluir médico", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDoctorDetail = (updatedDoctor: Doctor) => {
    // showMessage(
    //   "Função de atualizar detalhes do médico ainda não suportada",
    //   "info"
    // );
  };
  // ... As funções auxiliares de parsing e formatação permanecem iguais, apenas traduza mensagens de erro e comentários se desejar ...

  // Definição das colunas da tabela
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
      flex: 0.5,
    },
    {
      field: "avatar",
      headerName: "Foto",
      width: 80,
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Avatar src={(params.value as string) || "/default-avatar.png"} />
      ),
      sortable: false,
    },
    {
      field: "userId",
      headerName: "Código do médico",
      width: 120,
      flex: 0.8,
    },
    {
      field: "firstName",
      headerName: "Nome",
      width: 100,
      flex: 0.8,
    },
    {
      field: "lastName",
      headerName: "Sobrenome",
      width: 120,
      flex: 0.8,
    },
    {
      field: "specialization",
      headerName: "Especialidade",
      width: 150,
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Telefone",
      width: 130,
      flex: 0.8,
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      flex: 0.8,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? "Ativo" : "Inativo"}
          color={params.value ? "success" : "error"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 80,
      flex: 0.7,
      sortable: false,
      disableExport: true,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", gap: 1, height: "100%" }}>
          <IconButton
            size="small"
            color="primary"
            title="Ver detalhes"
            onClick={() => handleViewDetail(params.row)}
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            title="Excluir"
            onClick={() => handleDeleteClick(params.row.id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: "100%", width: "100%", padding: 0 }}>
      {/* Header com botões de adicionar e importar */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddClick}
        >
          Adicionar médico
        </Button>
      </Box>

      {/* Tabela de médicos */}
      <Paper sx={{ width: "100%" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, color: "error.main" }}>{error}</Box>
        ) : (
          <DataGrid
            rows={doctors}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
                csvOptions: csvOptions,
              },
            }}
            disableRowSelectionOnClick
            disableColumnFilter={false}
            disableDensitySelector={false}
            disableColumnSelector={false}
            loading={loading}
          />
        )}
      </Paper>

      {/* Formulário de adicionar/editar médico */}
      <DoctorForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        doctor={selectedDoctor}
        mode={formMode}
        isSubmitting={submitting}
      />

      {/* Modal de detalhes do médico */}
      <DoctorDetailModal
        open={isDetailOpen}
        onClose={handleDetailClose}
        doctor={selectedDoctor}
        onUpdate={handleUpdateDoctorDetail}
      />
    </Box>
  );
};

export default DoctorManagementPage;
