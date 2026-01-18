import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import axios from 'axios';
import { Icon } from 'react-native-elements';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'home'>;

const Theme = {
    text: '#1F2937',
    primary: '#2563EB',
    success: '#10B981',
    secondary: '#F3F4F6',
    background: '#FFFFFF',
    danger: '#EF4444',
    API_URL: 'http://10.0.2.2:3000/api/tasks' // Android Emulator Localhost
};

interface Task {
    id: string;
    title: string;
    dueDate?: string;
    completed: boolean;
}

// --- Components ---

const Header = ({ title }: { title: string }) => (
    <View style={[styles.header, { backgroundColor: Theme.primary }]}>
        <Text style={styles.headerTitle}>{title}</Text>
    </View>
);

const SearchBar = ({ placeholder, onSearch }: { placeholder: string; onSearch: (term: string) => void }) => (
    <View style={styles.searchContainer}>
        <Icon name="search" type="feather" size={20} color={Theme.text} style={{ marginRight: 8 }} />
        <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            onChangeText={onSearch}
        />
    </View>
);

const TaskCard = ({ item, onTap }: { item: Task, onTap: () => void }) => {
    const isOverdue = item.dueDate && !item.completed && new Date(item.dueDate) < new Date();
    
    const formattedDate = item.dueDate 
        ? new Date(item.dueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Tarih Yok';

    return (
        <TouchableOpacity style={styles.card} onPress={onTap}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon
                    name={item.completed ? 'check-circle' : 'circle'}
                    type="feather"
                    color={item.completed ? Theme.success : Theme.primary}
                    size={24}
                />
                <View style={{ marginLeft: 15, flex: 1 }}>
                    <Text 
                        style={[
                            styles.cardTitle, 
                            item.completed && styles.cardTitleCompleted
                        ]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    <Text style={[styles.cardDate, isOverdue && { color: Theme.danger }]}>
                        {formattedDate}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const FAB = ({ icon, action }: { icon: string; action: () => void }) => (
    <TouchableOpacity style={[styles.fab, { backgroundColor: Theme.primary }]} onPress={action}>
        <Icon name={icon} type="feather" color="#FFFFFF" size={30} />
    </TouchableOpacity>
);

// --- Screen Logic ---

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchTasks = useCallback(async (searchQuery = '') => {
        setLoading(true);
        try {
            const response = await axios.get(`${Theme.API_URL}?search=${searchQuery}`);
            setTasks(response.data);
        } catch (error) {
            Alert.alert('Hata', 'Görevler yüklenirken bir sorun oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Debounce search input ideally, but for simplicity, immediate search on change
        fetchTasks(searchTerm);
    }, [searchTerm, fetchTasks]);

    // Re-fetch when navigating back to ensure fresh data
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchTasks(searchTerm);
        });
        return unsubscribe;
    }, [navigation, fetchTasks, searchTerm]);


    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    const navigateToDetail = (taskId: string) => {
        navigation.navigate('detail', { taskId });
    };

    const renderItem = ({ item }: { item: Task }) => (
        <TaskCard item={item} onTap={() => navigateToDetail(item.id)} />
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header title="Yapılacaklar" />
            <View style={styles.container}>
                <SearchBar 
                    placeholder="Görev ara..." 
                    onSearch={handleSearch} 
                />

                {loading && tasks.length === 0 ? (
                    <ActivityIndicator size="large" color={Theme.primary} style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Henüz görev yok. Yeni bir görev ekleyin.</Text>
                            </View>
                        )}
                        refreshing={loading}
                        onRefresh={() => fetchTasks(searchTerm)}
                    />
                )}

                <FAB 
                    icon="plus" 
                    action={() => navigation.navigate('add')} 
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Theme.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 15,
    },
    header: {
        paddingTop: 10,
        paddingBottom: 15,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.secondary,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginVertical: 15,
        height: 45,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Theme.text,
    },
    card: {
        backgroundColor: Theme.secondary,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: Theme.text,
    },
    cardTitleCompleted: {
        textDecorationLine: 'line-through',
        color: '#9CA3AF',
    },
    cardDate: {
        fontSize: 13,
        color: Theme.text,
        marginTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: Theme.text,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
});

export default HomeScreen;
