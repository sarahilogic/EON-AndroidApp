package com.example.eon

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.eon.ui.theme.EonTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            EonTheme {
                ChatScreen()
            }
        }
    }
}

@Composable
fun ChatScreen() {
    var messages by remember { mutableStateOf(listOf("Welcome to Sarahi chat")) }
    var input by remember { mutableStateOf(TextFieldValue("")) }
    var isSending by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    Scaffold(
        modifier = Modifier.fillMaxSize()
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Messages list
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(8.dp)
            ) {
                items(messages) { msg ->
                    Text(
                        text = msg,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }
            }

            // Input row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextField(
                    modifier = Modifier.weight(1f),
                    value = input,
                    onValueChange = { input = it },
                    placeholder = { Text("Type a message…") },
                    maxLines = 3,
                    enabled = !isSending
                )

                Spacer(modifier = Modifier.width(8.dp))

                Button(
                    enabled = !isSending,
                    onClick = {
                        val text = input.text.trim()
                        if (text.isNotEmpty()) {
                            messages = messages + "You: $text"
                            input = TextFieldValue("")
                            isSending = true

                            scope.launch {
                                try {
                                    val response = ChatApiClient.api.sendMessage(
                                        ChatRequest(message = text)
                                    )
                                    messages = messages + "Sarahi: ${response.reply}"
                                } catch (e: Exception) {
                                    messages = messages + "Sarahi: (error: ${e.message})"
                                } finally {
                                    isSending = false
                                }
                            }
                        }
                    }
                ) {
                    Text(if (isSending) "..." else "Send")
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ChatScreenPreview() {
    EonTheme {
        ChatScreen()
    }
}