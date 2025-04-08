import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class TextProcessingService extends ChangeNotifier {
  String? _processedText;
  bool _isLoading = false;
  String? _error;
  
  // URL k našemu API backendu - bude nutné aktualizovat podle skutečného nasazení
  // Pro lokální testování s emulátorem použijte IP adresu počítače místo localhost
  // Pro Android emulátor: 10.0.2.2 (speciální adresa, která směruje na localhost počítače)
  final String _apiUrl = 'http://10.0.2.2:8000/api/process-text';
  
  String? get processedText => _processedText;
  bool get isLoading => _isLoading;
  String? get error => _error;

  set processedText(String? value) {
    _processedText = value;
    notifyListeners();
  }

  Future<void> processText(String text) async {
    if (text.isEmpty) return;
    
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      // Volání našeho vlastního API backendu místo přímého volání Gemini
      final response = await http.post(
        Uri.parse(_apiUrl),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'text': text,
        }),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _processedText = data['processedText'];
      } else {
        // Zpracování chyby od serveru
        final error = jsonDecode(response.body);
        throw Exception(error['error'] ?? 'Chyba při komunikaci se serverem');
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Chyba při zpracování textu: ${e.toString()}';
      _isLoading = false;
      notifyListeners();
      
      if (kDebugMode) {
        print('Error processing text: $e');
      }
    }
  }
}