import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Portal, Modal, Text, TextInput, Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";

interface ContestInfoModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (
    contest: {
      _id: string | null;
      name: string;
      description: string;
      start_time: string;
      duration: number;
    },
    isEditing: boolean
  ) => void;
  contestToEdit?: {
    _id: string | null;
    name: string;
    description: string;
    start_time: string;
    duration: number;
  } | null;
}

const ContestInfoModal: React.FC<ContestInfoModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  contestToEdit,
}) => {
  const [contest, setContest] = useState({
    _id: "",
    name: "",
    description: "",
    start_time: new Date(),
    duration: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (contestToEdit) {
      setContest({
        _id: contestToEdit?._id ? contestToEdit?._id : "",
        name: contestToEdit.name,
        description: contestToEdit.description,
        start_time: new Date(contestToEdit.start_time),
        duration: contestToEdit.duration.toString(),
      });
    } else {
      setContest({
        _id: null,
        name: "",
        description: "",
        start_time: new Date(),
        duration: "",
      });
    }
  }, [contestToEdit]);

  const handleSave = () => {
    if (!contest.name || !contest.duration) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const formattedContest = {
      ...contest,
      duration: parseInt(contest.duration, 10),
      start_time: contest.start_time.toISOString(),
    };

    onSubmit(formattedContest, !!contestToEdit);
    onDismiss();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setContest({ ...contest, start_time: selectedDate });
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Text style={styles.modalTitle}>
          {contestToEdit ? "Sửa Cuộc Thi" : "Thêm Cuộc Thi"}
        </Text>
        <TextInput
          label="Tên Cuộc Thi"
          value={contest.name}
          onChangeText={(text) => setContest({ ...contest, name: text })}
          style={styles.input}
        />
        <TextInput
          label="Mô Tả"
          value={contest.description}
          onChangeText={(text) => setContest({ ...contest, description: text })}
          style={styles.input}
        />
        <Text style={styles.label}>Thời Gian Bắt Đầu</Text>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.datePickerButton}
        >
          {contest.start_time.toLocaleString()}
        </Button>
        {showDatePicker && (
          <DateTimePicker
            value={contest.start_time}
            mode="datetime"
            display="default"
            onChange={handleDateChange}
          />
        )}
        <TextInput
          label="Thời Lượng (phút)"
          value={contest.duration}
          onChangeText={(text) => setContest({ ...contest, duration: text })}
          style={styles.input}
          keyboardType="numeric"
          placeholder="Nhập thời lượng (phút)"
        />
        <View style={styles.modalActions}>
          <Button mode="text" onPress={onDismiss}>
            Hủy
          </Button>
          <Button mode="contained" onPress={handleSave}>
            Lưu
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 30,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
  },
  datePickerButton: {
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});

export default ContestInfoModal;
