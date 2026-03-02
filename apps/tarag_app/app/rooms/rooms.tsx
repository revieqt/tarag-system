import OptionsPopup from "@/components/OptionsPopup";
import TextField from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import ThemedIcons from "@/components/ThemedIcons";
import { ThemedView } from "@/components/ThemedView";
import { router } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from '@react-navigation/native';
import EmptyMessage from '@/components/EmptyMessage';
import { useSession } from "@/context/SessionContext";
import LoadingContainerAnimation from "@/components/LoadingContainerAnimation";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function GroupsSection({ activeTab ="all", refreshTrigger }: {activeTab?: string, refreshTrigger?: boolean}){
    const { session } = useSession();
    const [selectedTab, setSelectedTab] = useState<string>(activeTab);
    const primaryColor = useThemeColor({}, 'primary');
    const secondaryColor = useThemeColor({}, 'secondary');
    const accentColor = useThemeColor({}, 'accent');  
    const textColor = useThemeColor({}, 'text');
    
    // State management
    const [searchText, setSearchText] = useState("");

    return (
    <View style={{padding: 16}}>

        <View style={styles.buttonsRow}>
            <TouchableOpacity style={[styles.buttons, {backgroundColor: secondaryColor}]} onPress={()=> router.push('/rooms/rooms-create')}>
                <ThemedIcons name="plus" size={20} color='white'/>
                <ThemedText style={{color: 'white'}}>Create Room</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.buttons, {backgroundColor: primaryColor}]}>
                <ThemedIcons name="door-open" size={20}/>
                <ThemedText>Join a Room</ThemedText>
            </TouchableOpacity>
        </View>
    </View>
    
   ); 
}

const styles = StyleSheet.create({
    buttonsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    buttons:{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 50,
        gap: 4,
    }
});