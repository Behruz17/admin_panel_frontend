import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from 'moment';
import axios from 'axios';

const OpAdaptationPlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    mentor_id: '',
    trainee_id: '',
    start_date: null,
    end_date: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, mentorsRes, traineesRes] = await Promise.all([
        axios.get('https://admin-panel-l87a.onrender.com/api/staff-adaptation-plans'),
        axios.get('https://admin-panel-l87a.onrender.com/api/users/mentors'),
        axios.get('https://admin-panel-l87a.onrender.com/api/candidates/trainees'),
      ]);

      setPlans(plansRes.data);
      setMentors(mentorsRes.data);
      setTrainees(traineesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleOpenDialog = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        mentor_id: plan.mentor_id,
        trainee_id: plan.trainee_id,
        start_date: moment(plan.start_date),
        end_date: moment(plan.end_date),
      });
    } else {
      setEditingPlan(null);
      setFormData({
        mentor_id: '',
        trainee_id: '',
        start_date: null,
        end_date: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlan(null);
    setFormData({
      mentor_id: '',
      trainee_id: '',
      start_date: null,
      end_date: null,
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        start_date: formData.start_date.format('YYYY-MM-DD'),
        end_date: formData.end_date.format('YYYY-MM-DD'),
      };

      if (editingPlan) {
        await axios.put(`https://admin-panel-l87a.onrender.com/api/staff-adaptation-plans/${editingPlan.id}`, payload);
      } else {
        await axios.post('https://admin-panel-l87a.onrender.com/api/staff-adaptation-plans', payload);
      }

      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await axios.delete(`https://admin-panel-l87a.onrender.com/api/staff-adaptation-plans/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <h1>OP Adaptation Plans</h1>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add New Plan
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mentor</TableCell>
              <TableCell>Trainee</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.mentor.username}</TableCell>
                <TableCell>{plan.trainee.username}</TableCell>
                <TableCell>{moment(plan.start_date).format('DD.MM.YYYY')}</TableCell>
                <TableCell>{moment(plan.end_date).format('DD.MM.YYYY')}</TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => handleOpenDialog(plan)}>
                    Edit
                  </Button>
                  <Button color="error" onClick={() => handleDelete(plan.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPlan ? 'Edit Plan' : 'New Plan'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Mentor</InputLabel>
              <Select
                value={formData.mentor_id}
                onChange={(e) => setFormData({ ...formData, mentor_id: e.target.value })}
                label="Mentor"
              >
                {mentors.map((mentor) => (
                  <MenuItem key={mentor.id} value={mentor.id}>
                    {mentor.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Trainee</InputLabel>
              <Select
                value={formData.trainee_id}
                onChange={(e) => setFormData({ ...formData, trainee_id: e.target.value })}
                label="Trainee"
              >
                {trainees.map((trainee) => (
                  <MenuItem key={trainee.id} value={trainee.id}>
                    {trainee.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterMoment}>
              <Box sx={{ mb: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(date) => setFormData({ ...formData, start_date: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={(date) => setFormData({ ...formData, end_date: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingPlan ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OpAdaptationPlanPage; 