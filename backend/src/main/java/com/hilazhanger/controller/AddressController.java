package com.hilazhanger.controller;

import com.hilazhanger.dto.AddressDtos;
import com.hilazhanger.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users/me/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public List<AddressDtos.AddressDto> list(Authentication auth) {
        return addressService.list(userId(auth));
    }

    @PostMapping
    public AddressDtos.AddressDto create(Authentication auth, @Valid @RequestBody AddressDtos.AddressRequest request) {
        return addressService.create(userId(auth), request);
    }

    @PutMapping("/{id}")
    public AddressDtos.AddressDto update(
            Authentication auth,
            @PathVariable UUID id,
            @Valid @RequestBody AddressDtos.AddressRequest request
    ) {
        return addressService.update(userId(auth), id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(Authentication auth, @PathVariable UUID id) {
        addressService.delete(userId(auth), id);
    }

    private UUID userId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return UUID.fromString(auth.getPrincipal().toString());
    }
}
