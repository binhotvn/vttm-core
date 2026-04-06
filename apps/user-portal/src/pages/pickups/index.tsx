import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { StatusTag } from '@/components/shared/status-tag';
import apiClient from '@/lib/api-client';

export function PickupsPage() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/pickups?limit=20');
      const result = res.data.data;
      setData(result.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchPickups(); }, []);

  const handleCreate = async (values: any) => {
    try {
      await apiClient.post('/pickups', {
        pickupAddress: { contactName: values.contactName, phone: values.phone, streetAddress: values.address, country: 'VN' },
        contactInfo: { name: values.contactName, phone: values.phone },
        requestedDate: values.date.toISOString(),
        timeSlot: values.timeSlot ? JSON.parse(values.timeSlot) : undefined,
        estimatedPieceCount: values.pieceCount || 0,
        estimatedWeightKg: values.weightKg || 0,
        specialInstructions: values.notes,
      });
      message.success(i18n.language === 'vi' ? '\u0110\u1EB7t l\u1ECBch l\u1EA5y h\u00E0ng th\u00E0nh c\u00F4ng' : 'Pickup scheduled');
      setModalOpen(false);
      form.resetFields();
      fetchPickups();
    } catch { message.error('Failed'); }
  };

  const columns = [
    { title: 'Pickup #', dataIndex: 'pickupNumber', key: 'num' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s} lang={i18n.language} /> },
    { title: 'Contact', dataIndex: 'contactInfo', key: 'contact', render: (c: any) => `${c?.name} (${c?.phone})` },
    { title: 'Time', dataIndex: 'timeSlot', key: 'time', render: (s: any) => s?.label || '\u2014' },
    { title: 'Pieces', dataIndex: 'estimatedPieceCount', key: 'pieces' },
    { title: 'Date', dataIndex: 'requestedDate', key: 'date', render: (d: string) => new Date(d).toLocaleDateString('vi-VN') },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>{t('nav.pickups')}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          {i18n.language === 'vi' ? '\u0110\u1EB7t l\u1ECBch l\u1EA5y h\u00E0ng' : 'Schedule Pickup'}
        </Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} />

      <Modal title={i18n.language === 'vi' ? '\u0110\u1EB7t l\u1ECBch l\u1EA5y h\u00E0ng' : 'Schedule Pickup'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="contactName" label={t('auth.fullName')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label={t('auth.phone')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="address" label={i18n.language === 'vi' ? '\u0110\u1ECBa ch\u1EC9' : 'Address'} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="date" label={i18n.language === 'vi' ? 'Ng\u00E0y l\u1EA5y' : 'Pickup Date'} rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="timeSlot" label={i18n.language === 'vi' ? 'Khung gi\u1EDD' : 'Time Slot'}>
            <Select options={[
              { value: '{"start":"08:00","end":"12:00","label":"S\u00E1ng (8h-12h)"}', label: 'S\u00E1ng (8h-12h)' },
              { value: '{"start":"13:00","end":"17:00","label":"Chi\u1EC1u (13h-17h)"}', label: 'Chi\u1EC1u (13h-17h)' },
              { value: '{"start":"17:00","end":"21:00","label":"T\u1ED1i (17h-21h)"}', label: 'T\u1ED1i (17h-21h)' },
            ]} />
          </Form.Item>
          <Form.Item name="pieceCount" label={i18n.language === 'vi' ? 'S\u1ED1 ki\u1EC7n' : 'Pieces'}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="notes" label={i18n.language === 'vi' ? 'Ghi ch\u00FA' : 'Notes'}><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
