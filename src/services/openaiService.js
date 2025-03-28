// u041eu0431u043du043eu0432u043bu0435u043du043du044bu0439 u0441u0435u0440u0432u0438u0441 OpenAI u0441 u043fu043eu0434u0434u0435u0440u0436u043au043eu0439 u043fu043eu0442u043eu043au043eu0432u043eu0439 u043fu0435u0440u0435u0434u0430u0447u0438 u0438 Assistant API

/**
 * u041eu0442u043fu0440u0430u0432u043bu044fu0435u0442 u0437u0430u043fu0440u043eu0441 u043du0430 u0441u0435u0440u0432u0435u0440 u0438 u043fu043eu043bu0443u0447u0430u0435u0442 u043eu0442u0432u0435u0442 u0447u0435u0440u0435u0437 u043eu0431u044bu0447u043du044bu0439 API
 * @param {Array} messages - u0421u043fu0438u0441u043eu043a u0441u043eu043eu0431u0449u0435u043du0438u0439 u0434u043bu044f u043eu0442u043fu0440u0430u0432u043au0438 u043du0430 u0441u0435u0440u0432u0435u0440
 * @returns {Promise} - u041eu0442u0432u0435u0442 u043eu0442 u0441u0435u0440u0432u0435u0440u0430
 */
async function getChatCompletion(messages) {
  try {
    console.log('u041eu0442u043fu0440u0430u0432u043au0430 u0437u0430u043fu0440u043eu0441u0430 u043du0430 u0441u0435u0440u0432u0435u0440...', messages);
    
    // u0418u0441u043fu043eu043bu044cu0437u0443u0435u043c u0442u0435u043au0443u0449u0438u0439 u0445u043eu0441u0442 u0432u043cu0435u0441u0442u043e u043bu043eu043au0430u043bu044cu043du043eu0433u043e u0441u0435u0440u0432u0435u0440u0430
    const baseUrl = window.location.origin;
    const apiUrl = `${baseUrl}/api/chat`;
    console.log('u0418u0441u043fu043eu043bu044cu0437u0443u0435u043c API URL:', apiUrl);
    
    // u041eu0442u043fu0440u0430u0432u043au0430 u0437u0430u043fu0440u043eu0441u0430 u043du0430 u0441u0435u0440u0432u0435u0440
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o', // u0418u0441u043fu043eu043bu044cu0437u0443u0435u043c u043cu043eu0434u0435u043bu044c gpt-4o
        messages: messages
      })
    });
    
    // u041fu0440u043eu0432u0435u0440u043au0430 u0443u0441u043fu0435u0448u043du043eu0433u043e u043eu0442u0432u0435u0442u0430
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0431u0440u0430u0431u043eu0442u043au0435 JSON-u043eu0442u0432u0435u0442u0430'
      }));
      throw new Error(`u041eu0448u0438u0431u043au0430 u0437u0430u043fu0440u043eu0441u0430: ${response.status} - ${errorData.error || response.statusText}`);
    }
    
    // u041fu043eu043bu0443u0447u0435u043du0438u0435 u0434u0430u043du043du044bu0445 u043eu0442u0432u0435u0442u0430
    const data = await response.json();
    console.log('u041fu043eu043bu0443u0447u0435u043d u043eu0442u0432u0435u0442 u043eu0442 u0441u0435u0440u0432u0435u0440u0430:', data);
    
    return data;
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0442u043fu0440u0430u0432u043au0435 u0437u0430u043fu0440u043eu0441u0430:', error);
    throw error;
  }
}

/**
 * u041eu0442u043fu0440u0430u0432u043bu044fu0435u0442 u0437u0430u043fu0440u043eu0441 u043du0430 u0441u0435u0440u0432u0435u0440 u0441 u0438u0441u043fu043eu043bu044cu0437u043eu0432u0430u043du0438u0435u043c u043fu043eu0442u043eu043au043eu0432u043eu0439 u043fu0435u0440u0435u0434u0430u0447u0438
 * @param {Array} messages - u0421u043fu0438u0441u043eu043a u0441u043eu043eu0431u0449u0435u043du0438u0439 u0434u043bu044f u043eu0442u043fu0440u0430u0432u043au0438 u043du0430 u0441u0435u0440u0432u0435u0440
 * @param {Function} onChunk - u041au043eu043bu043bu0431u044du043a u0434u043bu044f u043eu0431u0440u0430u0431u043eu0442u043au0438 u043au0430u0436u0434u043eu0433u043e u0444u0440u0430u0433u043cu0435u043du0442u0430 u043eu0442u0432u0435u0442u0430
 * @param {Function} onComplete - u041au043eu043bu043bu0431u044du043a u043fu043e u0437u0430u0432u0435u0440u0448u0435u043du0438u0438 u043fu043eu0442u043eu043au0430
 * @param {Function} onError - u041au043eu043bu043bu0431u044du043a u0434u043bu044f u043eu0431u0440u0430u0431u043eu0442u043au0438 u043eu0448u0438u0431u043eu043a
 */
async function getChatCompletionStream(messages, onChunk, onComplete, onError) {
  try {
    console.log('u041eu0442u043fu0440u0430u0432u043au0430 u043fu043eu0442u043eu043au043eu0432u043eu0433u043e u0437u0430u043fu0440u043eu0441u0430 u043du0430 u0441u0435u0440u0432u0435u0440...', messages);
    
    const baseUrl = window.location.origin;
    const apiUrl = `${baseUrl}/api/chat/stream`;
    console.log('u0418u0441u043fu043eu043bu044cu0437u0443u0435u043c Stream API URL:', apiUrl);
    
    // u041eu0442u043fu0440u0430u0432u043au0430 u0437u0430u043fu0440u043eu0441u0430 u043du0430 u0441u0435u0440u0432u0435u0440
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages
      })
    });
    
    // u041fu0440u043eu0432u0435u0440u043au0430 u0443u0441u043fu0435u0448u043du043eu0433u043e u043eu0442u0432u0435u0442u0430
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0431u0440u0430u0431u043eu0442u043au0435 JSON-u043eu0442u0432u0435u0442u0430'
      }));
      throw new Error(`u041eu0448u0438u0431u043au0430 u043fu043eu0442u043eu043au043eu0432u043eu0433u043e u0437u0430u043fu0440u043eu0441u0430: ${response.status} - ${errorData.error || response.statusText}`);
    }
    
    // u041eu0431u0440u0430u0431u043eu0442u043au0430 u043fu043eu0442u043eu043au043eu0432u044bu0445 u0434u0430u043du043du044bu0445 (Server-Sent Events)
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let completeResponse = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      // u0414u0435u043au043eu0434u0438u0440u0443u0435u043c u043fu043eu043bu0443u0447u0435u043du043du044bu0435 u0434u0430u043du043du044bu0435
      const text = decoder.decode(value, { stream: true });
      buffer += text;
      
      // u041eu0431u0440u0430u0431u0430u0442u044bu0432u0430u0435u043c u043au0430u0436u0434u0443u044e u0441u0442u0440u043eu043au0443 u0434u0430u043du043du044bu0445
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.error) {
              if (onError) onError(parsed.error);
              return;
            }
            
            if (parsed.done) {
              if (onComplete) onComplete(completeResponse);
              return;
            }
            
            if (parsed.chunk) {
              completeResponse += parsed.chunk;
              if (onChunk) onChunk(parsed.chunk, completeResponse);
            }
          } catch (e) {
            console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0431u0440u0430u0431u043eu0442u043au0435 u0434u0430u043du043du044bu0445 u043fu043eu0442u043eu043au0430:', e);
          }
        }
      }
    }
    
    // u0415u0441u043bu0438 u043cu044b u0434u043eu0448u043bu0438 u0434u043e u044du0442u043eu0439 u0442u043eu0447u043au0438, u0437u043du0430u0447u0438u0442 u043fu043eu0442u043eu043a u0437u0430u0432u0435u0440u0448u0435u043d u0431u0435u0437 u044fu0432u043du043eu0433u043e u0441u0438u0433u043du0430u043bu0430 done
    if (onComplete) onComplete(completeResponse);

  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0442u043fu0440u0430u0432u043au0435 u043fu043eu0442u043eu043au043eu0432u043eu0433u043e u0437u0430u043fu0440u043eu0441u0430:', error);
    if (onError) onError(error.message);
    else throw error;
  }
}

/**
 * u041eu0442u043fu0440u0430u0432u043bu044fu0435u0442 u0437u0430u043fu0440u043eu0441 u043du0430 u0441u0435u0440u0432u0435u0440 u0441 u0438u0441u043fu043eu043bu044cu0437u043eu0432u0430u043du0438u0435u043c OpenAI Assistant API
 * @param {string} message - u0422u0435u043au0441u0442 u0441u043eu043eu0431u0449u0435u043du0438u044f u043fu043eu043bu044cu0437u043eu0432u0430u0442u0435u043bu044f
 * @param {string} materialId - u0418u0434u0435u043du0442u0438u0444u0438u043au0430u0442u043eu0440 u043cu0430u0442u0435u0440u0438u0430u043bu0430/u043fu0440u0435u0434u043cu0435u0442u0430
 * @returns {Promise} - u041eu0442u0432u0435u0442 u043eu0442 u0441u0435u0440u0432u0435u0440u0430 u0432 u0444u043eu0440u043cu0430u0442u0435 {reply}
 */
async function getAssistantReply(message, materialId) {
  try {
    console.log(`u041eu0442u043fu0440u0430u0432u043au0430 u0437u0430u043fu0440u043eu0441u0430 u043a u0430u0441u0441u0438u0441u0442u0435u043du0442u0443 u043fu043e u043cu0430u0442u0435u0440u0438u0430u043bu0443 ${materialId}:`, message);
    
    const baseUrl = window.location.origin;
    const apiUrl = `${baseUrl}/chat`;
    console.log('u0418u0441u043fu043eu043bu044cu0437u0443u0435u043c Assistant API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        material_id: materialId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0431u0440u0430u0431u043eu0442u043au0435 JSON-u043eu0442u0432u0435u0442u0430'
      }));
      throw new Error(`u041eu0448u0438u0431u043au0430 u0437u0430u043fu0440u043eu0441u0430 u043a u0430u0441u0441u0438u0441u0442u0435u043du0442u0443: ${response.status} - ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('u041fu043eu043bu0443u0447u0435u043d u043eu0442u0432u0435u0442 u043eu0442 u0430u0441u0441u0438u0441u0442u0435u043du0442u0430:', data);
    
    return data;
  } catch (error) {
    console.error('u041eu0448u0438u0431u043au0430 u043fu0440u0438 u043eu0442u043fu0440u0430u0432u043au0435 u0437u0430u043fu0440u043eu0441u0430 u043a u0430u0441u0441u0438u0441u0442u0435u043du0442u0443:', error);
    throw error;
  }
}

/**
 * u041fu043eu043bu0443u0447u0430u0435u0442 u0441u043fu0438u0441u043eu043a u0434u043eu0441u0442u0443u043fu043du044bu0445 u043cu0430u0442u0435u0440u0438u0430u043bu043eu0432 (u0442u0438u043fu043eu0432 u0430u0441u0441u0438u0441u0442u0435u043du0442u043eu0432)
 * @returns {Array} - u0421u043fu0438u0441u043eu043a u0434u043eu0441u0442u0443u043fu043du044bu0445 u043cu0430u0442u0435u0440u0438u0430u043bu043eu0432
 */
function getAvailableMaterials() {
  // u0422u0435u043au0443u0449u0430u044f u0437u0430u0433u043bu0443u0448u043au0430, u0432 u0431u0443u0434u0443u0449u0435u043c u043cu043eu0436u043du043e u0440u0435u0430u043bu0438u0437u043eu0432u0430u0442u044c u0437u0430u043fu0440u043eu0441 u043a API
  return [
    { id: 'trainer_math1', name: 'u041cu0430u0442u0435u043cu0430u0442u0438u043au0430 1' },
    { id: 'trainer_math2', name: 'u041cu0430u0442u0435u043cu0430u0442u0438u043au0430 2' },
    { id: 'trainer_analogies', name: 'u0410u043du0430u043bu043eu0433u0438u0438 u0438 u0434u043eu043fu043eu043bu043du0435u043du0438u044f' },
    { id: 'trainer_reading', name: 'u0427u0442u0435u043du0438u0435 u0438 u043fu043eu043du0438u043cu0430u043du0438u0435' },
    { id: 'test_full', name: 'u041fu0440u043eu0431u043du043eu0435 u0442u0435u0441u0442u0438u0440u043eu0432u0430u043du0438u0435' }
  ];
}

export { getChatCompletion, getChatCompletionStream, getAssistantReply, getAvailableMaterials };
